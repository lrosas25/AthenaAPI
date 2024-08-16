import AP from "../model/AP.js"
import TreasuryClearing from "../model/TreasuryClearing.js";
import APSAP from "../model/APSAP.js";
import QASPOLineItemMatching from "../model/QASPOLineItemMatching.js";
import QASPOTotal from "../model/QASPOTotal.js";
import MaintenanceValCl from "../model/MaintenanceValCl.js";
import mongoose from "mongoose";
import processTreasury from "../helpers/processTreasury.js";
import processAllCSVFiles from "../helpers/processCSVFiles.js";
import glDocType from "../model/glDocType.js";
import Archimedes from "../model/Archimedes.js";
const generateController = {
    generateAP: async (req, res) => {
        const inputDir = "./fileUploads/In/ap";
        const outputDir = "./fileUploads/out/ap";
        const POLineItemTotalData = [];
        const POTotalData = [];
        try {
            // Process all CSV files in the input directory
            const data = await processAllCSVFiles(inputDir, outputDir, 4, 6);
            if (!data) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            await AP.deleteMany({})
            await QASPOLineItemMatching.deleteMany({})
            await QASPOTotal.deleteMany({})
            data.forEach(async (item) => {
                if (item["Purch.Doc."] && item["Item"]) {
                    // Convert the amount to a number
                    const amount = parseFloat(item["Amount in LC"].replace(/,/g, ''));
                    // Adjust amount based on MvT
                    let adjustedAmount;
                    if (item["MvT"] === '102') {
                        adjustedAmount = -amount;
                    } else if (item["MvT"] === '101') {
                        adjustedAmount = amount;
                    } else {
                        adjustedAmount = 0; // Handle other MvT values if needed
                    }
                    // Handle POLineItemTotalData
                    const existingEntry = POLineItemTotalData.find(entry =>
                        entry.purcDoc === item["Purch.Doc."] &&
                        entry.item === item["Item"]
                    );
                    if (existingEntry) {
                        // Update the existing entry's amount
                        const existingAmount = parseFloat(existingEntry.amountInLC.toString());
                        existingEntry.amountInLC = mongoose.Types.Decimal128.fromString(
                            (existingAmount + adjustedAmount).toFixed(2)
                        );
                    } else {
                        POLineItemTotalData.push({
                            purcDoc: item["Purch.Doc."],
                            item: item["Item"],
                            material: item["Material"],
                            shortText: item["Short Text"],
                            costCtr: item["Cost Ctr"],
                            profitCtr: item["Profit Ctr"],
                            amountInLC: mongoose.Types.Decimal128.fromString(adjustedAmount.toFixed(2))
                        });
                    }
                    // Handle POTotalData
                    let existingTotal = POTotalData.find(record => record.purcDoc === item["Purch.Doc."]);
                    if (existingTotal) {
                        const existingTotalAmount = parseFloat(existingTotal.totalAmountInLC.toString());
                        const newTotalAmount = existingTotalAmount + amount;
                        existingTotal.totalAmountInLC = mongoose.Types.Decimal128.fromString(newTotalAmount.toFixed(2));
                    } else {
                        POTotalData.push({
                            purcDoc: item["Purch.Doc."],
                            totalAmountInLC: mongoose.Types.Decimal128.fromString(amount.toFixed(2))
                        });
                    }
                }
                try {
                    const cleanedAmountString = item["Amount in LC"].replace(/[^0-9.]/g, '');
                    const cleanedScheduledQty = item["Scheduled Qty"].replace(/[^0-9.]/g, '');
                    const cleanedQtyDelivered = item["Qty Delivered"].replace(/[^0-9.]/g, '');
                    const cleanedQuantityinOPUn = item["Quantity in OPUn"].replace(/[^0-9.]/g, '');
                    const cleanedGRIRClearingValue = item["GR/IR clearing value in LC"]?.replace(/[^0-9.]/g, '');
                    const cleanedQuantity = item["Quantity"].replace(/[^0-9.]/g, '');
                    // Ensure the cleaned strings are valid Decimal128 values
                    const amountInDecimal128 = mongoose.Types.Decimal128.fromString(cleanedAmountString);
                    const scheduledQt = mongoose.Types.Decimal128.fromString(cleanedScheduledQty);
                    const quantity = mongoose.Types.Decimal128.fromString(cleanedQuantity);
                    const qtyDelivered = mongoose.Types.Decimal128.fromString(cleanedQtyDelivered);
                    const quantityinOpu = mongoose.Types.Decimal128.fromString(cleanedQuantityinOPUn);
                    const grIrClearingVal = cleanedGRIRClearingValue ? mongoose.Types.Decimal128.fromString(cleanedGRIRClearingValue) : null;
                    let glAcct = "";
                    let glDocuType = ""
                    if (item["ValCl"] === "") {
                        glAcct = item["G/L Acct"]
                        const matchingGlDocType = await glDocType.findOne({ glcode: { $regex: new RegExp("^" + glAcct + "$", "i") } })
                        glDocuType = matchingGlDocType ? (matchingGlDocType.documentType || "") : ""
                    } else {
                        const matchingRecord = await MaintenanceValCl.findOne({ valCl: { $regex: new RegExp("^" + item["ValCl"] + "$", "i") } });
                        glAcct = matchingRecord ? (matchingRecord.glAcct || "") : "";
                        const matchingGlDocType = await glDocType.findOne({ glcode: { $regex: new RegExp("^" + glAcct + "$", "i") } })
                        glDocuType = matchingGlDocType ? (matchingGlDocType.documentType || "") : ""
                    }
                    const result = await AP.create({
                        "orderdate": item["Order date"],
                        "delivdate": item["Deliv"][" Date"],
                        "cocd": item["CoCd"],
                        "purcdoc": item["Purch.Doc."],
                        "item": item.Item,
                        "material": item.Material,
                        "valcl": item["ValCl"] ? item["ValCl"] : "",
                        "shorttext": item["Short Text"],
                        "costctr": item["Cost Ctr"],
                        "profitctr": item["Profit Ctr"],
                        "scheduledqty": scheduledQt,
                        "oun": item["OUn"],
                        "qtydelivered": qtyDelivered,
                        "quantity": quantity,
                        "quantityinopun": quantityinOpu,
                        "opu": item["OPU"],
                        "amountinlc": amountInDecimal128,
                        "crcy": item["Crcy"],
                        "hct": item["HCt"],
                        "mvt": item["MvT"],
                        "d_c": item["D/C"],
                        "matdoc": item["Mat. Doc."],
                        "refdoc": item["Ref. Doc."],
                        "vendor": item["Vendor"],
                        "reference": item["Reference"],
                        "tx": item["Tx"],
                        "gl_acct": item["ValCl"] ? glAcct : item["G/L Acct"],
                        "dci": item["DCI"],
                        "fin": item["FIn"],
                        "documentno": item["DocumentNo"],
                        "grirclearingvalueinlc": grIrClearingVal,
                        "a": item["A"],
                        "name1": item["Name 1"] + " " + item["Name 2"],
                        "name2": "",
                        "taxnumber1": item["Tax Number 1"],
                        "salesperson": item["Salesperson"],
                        "telephone": item["Telephone"],
                        "doctype": glDocuType
                    });
                } catch (e) {
                    console.log(e.message);
                }
            });
            POLineItemTotalData.forEach(async (item) => {
                try {
                    await QASPOLineItemMatching.create({
                        "purchdoc": item.purcDoc,
                        "item": item.item,
                        "material": item.material,
                        "shorttext": item.shortText,
                        "costctr": item.costCtr,
                        "profitctr": item.profitCtr,
                        "amountinlc": mongoose.Types.Decimal128.fromString(item.amountInLC.toString())
                    });
                } catch (e) {
                    console.log(e.message);
                }
            })
            POTotalData.forEach(async (item) => {
                try {
                    await QASPOTotal.create({
                        "purchdoc": item.purcDoc,
                        "totalamountinlc": mongoose.Types.Decimal128.fromString(item.totalAmountInLC.toString())
                    });
                } catch (e) {
                    console.log(e);
                }
            })
            return res.status(200).json({ message: "Data created successfully." });
        } catch (e) {
            console.error("Error processing data:", e.message);
            return res.status(500).json({ message: e.message });
        }
    },
    generateAR: (req, res) => {

    },
    generateTreasuryClearing: async (req, res) => {
        const data = await processTreasury();
        if (data) {
            await TreasuryClearing.deleteMany({})
            for (let i = 0; i < data.length; i++) {
                const record = data[i];
                try {
                    const amountInLC = record["Amount in LC"].replace(/,/g, '');
                    const result = await TreasuryClearing.create({
                        pk: record["PK"],
                        cocd: record["CoCd"],
                        vendor: record["Vendor"],
                        name1: record["Name 1"] + " " + record["Name 2"],
                        name2: "",
                        documentno: record["DocumentNo"],
                        clringdoc: record["Clrng doc."],
                        amountinlc: mongoose.Types.Decimal128.fromString(amountInLC),
                        crcy: record["Crcy"],
                        clearing: record["Clearing"],
                        Housebk: record["House Bk"] ? record["House Bk"] : ""
                    });
                } catch (e) {
                    console.log(e);
                }
            }
            return res.status(200).json({ message: "Successfully Inserted the data" });
        } else {
            return res.status(400).json({ message: "No data found in the CSV folder." });
        }
    },
    generateAPSAP: async (req, res) => {
        const inputDir = "./fileUploads/In/apSap"
        const outputDir = "./fileUploads/out/apSap"
        try {
            const data = await processAllCSVFiles(inputDir, outputDir, 4, 6)
            if (!data) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            await APSAP.deleteMany({})
            for (let i = 0; i < data.length; i++) {
                const record = data[i]
                try {
                    const amountInLC = record["Amount in LC"].replace(/,/g, '');
                    const result = await APSAP.create({
                        "cocd": record["CoCd"],
                        "vendor": record["Vendor"],
                        "name1": record["Name 1"] + " " + record["Name 2"],
                        "name2": "",
                        "reference": record["Reference"],
                        "documentno": record["DocumentNo"],
                        "pstngdate": record["Pstng Date"],
                        "amountinlc": mongoose.Types.Decimal128.fromString(amountInLC),
                        "crcy": record["Crcy"] ? record["Crcy"] : ""
                    })
                } catch (e) {
                    console.log(e.message)
                }
            }
            return res.status(200).json({ message: "Successfully Generated" })
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    },
    generateArchimedes: async (req, res) => {
        const inputDir = "./fileUploads/In/archimedes";
        const outputDir = "./fileUploads/out/archimedes";
        try {
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0, true);
            if (!data) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            await Archimedes.deleteMany({})
            for (let i = 0; i < data.length; i++) {
                const record = data[i];
                let amount = record["Amount"].replace(/,/g, '');
                if (amount.startsWith('(') && amount.endsWith(')')) {
                    amount = `-${amount.slice(1, -1)}`;
                }
                const result = await Archimedes.create({
                    "company": record["Company"],
                    "itemno": record["Item No."],
                    "location": record["Location"],
                    "vendor": record["Vendor"],
                    "documenttype": record["Document Type"],
                    "documentno": record["Document No."],
                    "documentdate": record["Document Date"],
                    "pono": record["PO No."],
                    "amount": mongoose.Types.Decimal128.fromString(amount),
                    "currency": record["Currency"],
                    "status": record["Status"],
                    "inbox": record["Inbox"],
                    "statusdate": record["Status Date"]
                });
            }
            return res.status(200).json({ message: "Successfully inserted the data." });
        } catch (e) {
            console.log(e.message);
            return res.status(500).json({ message: e.message });
        }
    }
}
export default generateController