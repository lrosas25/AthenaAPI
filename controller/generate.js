import AP from "../model/AP.js"
import TreasuryClearing from "../model/TreasuryClearing.js";
import APSAP from "../model/APSAP.js";
import QASPOLineItemMatching from "../model/QASPOLineItemMatching.js";
import QASPOTotal from "../model/QASPOTotal.js";
import MaintenanceValCl from "../model/MaintenanceValCl.js";
import mongoose from "mongoose";
import moment from "moment-timezone";
import dateFormat from "dateformat";
import processTreasury from "../helpers/processTreasury.js";
import processAllCSVFiles from "../helpers/processCSVFiles.js";
import glDocType from "../model/glDocType.js";
import Archimedes from "../model/Archimedes.js";
import ArchimedesHistory from "../model/ArchimedesHistory.js";
import { bkpf } from "../model/rpa/BKPF.js";
import { bseg } from "../model/rpa/BSEG.js";
import { fb03 } from "../model/rpa/FB03.js";
import bankstatement from "../model/BankStatement.js";
import clearing from "../model/Clearing.js";
import { json } from "express";
const generateController = {
    generateAP: async (req, res) => {
        const inputDir = "./fileUploads/In/ap";
        const outputDir = "./fileUploads/out/ap";
        const POLineItemTotalData = [];
        const POTotalData = [];
        try {
            // Process all CSV files in the input directory
            const data = await processAllCSVFiles(inputDir, outputDir, 4, 6);
            if (!data || data.length === 0) {
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
                        const existingAmount = parseFloat(existingEntry.amountinlc.toString());
                        existingEntry.amountinlc = mongoose.Types.Decimal128.fromString(
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
                            amountinlc: mongoose.Types.Decimal128.fromString(adjustedAmount.toFixed(2))
                        });
                    }
                    // Handle POTotalData
                    let existingTotal = POTotalData.find(record => record.purcDoc === item["Purch.Doc."]);
                    if (existingTotal) {
                        const existingTotalAmount = parseFloat(existingTotal.totalamount.toString());
                        const newTotalAmount = existingTotalAmount + amount;
                        existingTotal.totalamount = mongoose.Types.Decimal128.fromString(newTotalAmount.toFixed(2));
                    } else {
                        POTotalData.push({
                            purcDoc: item["Purch.Doc."],
                            totalamount: mongoose.Types.Decimal128.fromString(amount.toFixed(2))
                        });
                    }
                }
                try {
                    const cleanedAmountStringInLC = item["Amount in LC"].replace(/[^0-9.]/g, '');
                    const cleanedAmountString = item["Amount"].replace(/[^0-9.]/g, '');
                    const cleanedScheduledQty = item["Scheduled Qty"].replace(/[^0-9.]/g, '');
                    const cleanedQtyDelivered = item["Qty Delivered"].replace(/[^0-9.]/g, '');
                    const cleanedQuantityinOPUn = item["Quantity in OPUn"].replace(/[^0-9.]/g, '');
                    const cleanedGRIRClearingValue = item["GR/IR clearing value in LC"].replace(/[^0-9.]/g, '');
                    const cleanedQuantity = item["Quantity"].replace(/[^0-9.]/g, '');
                    // Ensure the cleaned strings are valid Decimal128 values
                    const amountInLCInDecimal128 = mongoose.Types.Decimal128.fromString(cleanedAmountStringInLC);
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
                        "name": item["Name"],
                        "vatregistrationno": item["VAT Registration No."],
                        "purcdoc": item["Purch.Doc."],
                        "item": item.Item,
                        "material": item.Material,
                        "valcl": item["ValCl"] ? item["ValCl"] : "",
                        "shorttext": item["Short Text"],
                        "costctr": item["Cost Ctr"] + item["Profit Ctr"],
                        "profitctr": item["Profit Ctr"],
                        "scheduledqty": scheduledQt,
                        "oun": item["OUn"],
                        "qtydelivered": qtyDelivered,
                        "quantity": quantity,
                        "quantityinopun": quantityinOpu,
                        "opu": item["OPU"],
                        "amountinlc": amountInLCInDecimal128,
                        "crcyinlc": "PHP",
                        "amount": amountInDecimal128,
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
                        "amountinlc": mongoose.Types.Decimal128.fromString(item.amountinlc.toString())
                    });
                } catch (e) {
                    console.log(e.message);
                }
            })
            POTotalData.forEach(async (item) => {
                try {
                    await QASPOTotal.create({
                        "purchdoc": item.purcDoc,
                        "totalamount": mongoose.Types.Decimal128.fromString(item.totalamount.toString())
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

    //Clean RPA Mode
    generateAPAuto: async (req, res) => {
        const inputDir = "./fileUploads/rpa/In/ap";
        const outputDir = "./fileUploads/rpa/out/ap";
        const POLineItemTotalData = [];
        const POTotalData = [];
        try {
            // Process all CSV files in the input directory
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0 , ",");
            if (!data || data.length === 0) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            await AP.deleteMany({})
            await QASPOLineItemMatching.deleteMany({})
            await QASPOTotal.deleteMany({})
            data.forEach(async (item) => {
                console.log(item)
                if (item["Purch.Doc."] && item["Item"]) {
                    // Convert the amount to a number
                    const amount = parseFloat(item["Amount in LC"].replace(/[^\d.-]+/g, ''));
                    console.log(amount);
                    //parseFloat(item["Amount in LC"].replace(/,/g, ''));
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
                        const existingAmount = parseFloat(existingEntry.amountinlc.toString());
                        existingEntry.amountinlc = mongoose.Types.Decimal128.fromString(
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
                            amountinlc: mongoose.Types.Decimal128.fromString(adjustedAmount.toFixed(2))
                        });
                    }
                    // Handle POTotalData
                    let existingTotal = POTotalData.find(record => record.purcDoc === item["Purch.Doc."]);
                    if (existingTotal) {
                        const existingTotalAmount = parseFloat(existingTotal.totalamount.toString());
                        const newTotalAmount = existingTotalAmount + amount;
                        existingTotal.totalamount = mongoose.Types.Decimal128.fromString(newTotalAmount.toFixed(2));
                    } else {
                        POTotalData.push({
                            purcDoc: item["Purch.Doc."],
                            totalamount: mongoose.Types.Decimal128.fromString(amount.toFixed(2))
                        });
                    }
                }
                try {
                    //const cleanedAmountStringInLC = item["Amount in LC"].replace(/[^0-9.]/g, '');
                    const cleanedAmountStringInLC = item["Amount in LC"].replace(/[^\d.-]+/g, '');
                    const cleanedAmountString = item["Amount"].replace(/[^\d.-]+/g, '');
                    const cleanedScheduledQty = item["Scheduled Qty"].replace(/[^\d.-]+/g, '');
                    const cleanedQtyDelivered = item["Qty Delivered"].replace(/[^\d.-]+/g, '');
                    const cleanedQuantityinOPUn = item["Quantity in OPUn"].replace(/[^\d.-]+/g, '');
                    const cleanedGRIRClearingValue = item["GR/IR clearing value in LC"].replace(/[^\d.-]+/g, '');
                    const cleanedQuantity = item["Quantity"].replace(/[^\d.-]+/g, '');
                    // Ensure the cleaned strings are valid Decimal128 values
                    const amountInLCInDecimal128 = cleanedAmountStringInLC ? mongoose.Types.Decimal128.fromString(cleanedAmountStringInLC) : 0;
                    const amountInDecimal128 = cleanedAmountString ? mongoose.Types.Decimal128.fromString(cleanedAmountString) : 0;
                    const scheduledQt = cleanedScheduledQty ? mongoose.Types.Decimal128.fromString(cleanedScheduledQty) : 0;
                    const quantity = cleanedQuantity ? mongoose.Types.Decimal128.fromString(cleanedQuantity) : 0;
                    const qtyDelivered = cleanedQtyDelivered ? mongoose.Types.Decimal128.fromString(cleanedQtyDelivered) : 0;
                    const quantityinOpu = cleanedQuantityinOPUn ? mongoose.Types.Decimal128.fromString(cleanedQuantityinOPUn) : 0;
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
                        "name": item["Name"],
                        "vatregistrationno": item["VAT Registration No."],
                        "purcdoc": item["Purch.Doc."],
                        "item": item.Item,
                        "material": item.Material,
                        "valcl": item["ValCl"] ? item["ValCl"] : "",
                        "shorttext": item["Short Text"],
                        "costctr": item["Cost Ctr"] + item["Profit Ctr"],
                        "profitctr": item["Profit Ctr"],
                        "scheduledqty": scheduledQt,
                        "oun": item["OUn"],
                        "qtydelivered": qtyDelivered,
                        "quantity": quantity,
                        "quantityinopun": quantityinOpu,
                        "opu": item["OPU"],
                        "amountinlc": amountInLCInDecimal128,
                        "crcyinlc": "PHP",
                        "amount": amountInDecimal128,
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
                        "amountinlc": mongoose.Types.Decimal128.fromString(item.amountinlc.toString())
                    });
                } catch (e) {
                    console.log(e.message);
                }
            })
            POTotalData.forEach(async (item) => {
                try {
                    await QASPOTotal.create({
                        "purchdoc": item.purcDoc,
                        "totalamount": mongoose.Types.Decimal128.fromString(item.totalamount.toString())
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
                    const amount = record["Amount"].replace(/,/g, '');
                    const result = await TreasuryClearing.create({
                        // pk: record["PK"],
                        cocd: record["CoCd"],
                        vendor: record["Vendor"],
                        name1: record["Name 1"] + " " + record["Name 2"],
                        name2: "",
                        documentno: record["DocumentNo"],
                        clringdoc: record["Clrng doc."],
                        amount: mongoose.Types.Decimal128.fromString(amount),
                        crcy: record["Crcy"],
                        clearing: record["Clearing"],
                        housebk: record["House Bk"] ? record["House Bk"] : ""
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

    generateTreasuryClearingAuto: async (req, res) => {
        const inputDir = "./fileUploads/rpa/In/treasury";
        const outputDir = "./fileUploads/rpa/out/treasury";
        try{
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0 , ",");
            if (!data || data.length === 0) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }

            if (data) {
                await TreasuryClearing.deleteMany({})
                for (let i = 0; i < data.length; i++) {
                    const record = data[i];
                    try {
                        const amount = record["Amount"].replace(/[^\d.-]+/g, '');
                        const result = await TreasuryClearing.create({
                            // pk: record["PK"],
                            cocd: record["CoCd"],
                            vendor: record["Vendor"],
                            name1: record["Name 1"] + " " + record["Name 2"],
                            name2: "",
                            documentno: record["DocumentNo"],
                            clringdoc: record["Clrng doc."],
                            amount: mongoose.Types.Decimal128.fromString(amount),
                            crcy: record["Crcy"],
                            clearing: record["Clearing"],
                            housebk: record["House Bk"] ? record["House Bk"] : ""
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }
                return res.status(200).json({ message: "Successfully Inserted the data" });
            } else {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
        } catch (e){
            console.error("Error processing data:", e.message);
            return res.status(500).json({ message: e.message });
        }
        
    },

    generateAPSAP: async (req, res) => {
        const inputDir = "./fileUploads/In/apSap"
        const outputDir = "./fileUploads/out/apSap"
        try {
            const data = await processAllCSVFiles(inputDir, outputDir, 4, 3)
            if (!data || data.length === 0) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            await APSAP.deleteMany({})
            for (let i = 0; i < data.length; i++) {
                const record = data[i]
                try {
                    const amt = record["Amount"].replace(/,/g, '');
                    const result = await APSAP.create({
                        "docdate": record["Doc"][" Date"],
                        "cocd": record["CoCd"],
                        "vendor": record["Vendor"],
                        "name1": record["Name 1"] + " " + record["Name 2"],
                        "name2": "",
                        "reference": record["Reference"],
                        "documentno": record["DocumentNo"],
                        "pstngdate": record["Pstng Date"],
                        "amt": mongoose.Types.Decimal128.fromString(amt),
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

    generateAPSAPAuto: async (req, res) => {
        const inputDir = "./fileUploads/rpa/In/apSap"
        const outputDir = "./fileUploads/rpa/out/apSap"
        try {
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0, ",");
            if (!data || data.length === 0) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            await APSAP.deleteMany({})
            for (let i = 0; i < data.length; i++) {
                const record = data[i]
                try {
                    const amt = record["Amount"].replace(/[^\d.-]+/g, '');
                    const result = await APSAP.create({
                        "docdate": record["Doc"][" Date"],
                        "cocd": record["CoCd"],
                        "vendor": record["Vendor"],
                        "name1": record["Name 1"] + " " + record["Name 2"],
                        "name2": "",
                        "reference": record["Reference"],
                        "documentno": record["DocumentNo"],
                        "pstngdate": record["Pstng Date"],
                        "amt": mongoose.Types.Decimal128.fromString(amt),
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
                //record["Document Date"]
                //const documentdate = Date.parse(record["Document Date"]);
                //const duedate = new Date(documentdate);
                //duedate.setDate(documentdate.getDate + 30)


                let historyid
                try {
                    historyid = await ArchimedesHistory.findOne({imageid: record["Item No."]})
                } catch (error) {
                    console.log(error);
                } 
                
                if (historyid === null){
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
                        "statusdate": record["Status Date"],
                        "voucherno": record["Voucher No."],
                        "documenttype1": record["Document Type1"],
                        "category": record["Category"],
                        "priority": record["Priority"],
                        "duedate": record["Due Date"],
                        "file" : "https://athena.ftsfood.com.ph/view/view.aspx?id=" + record["Item No."]
    
                    });
                }else{
                    //console.log(archimedesid._id);
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
                        "statusdate": record["Status Date"],
                        "voucherno": record["Voucher No."],
                        "documenttype1": record["Document Type1"],
                        "category": record["Category"],
                        "priority": record["Priority"],
                        "duedate": record["Due Date"],
                        "file" : "https://athena.ftsfood.com.ph/view/view.aspx?id=" + record["Item No."],
                        "history" : historyid._id
    
                    });
                }

                
            }
            return res.status(200).json({ message: "Successfully inserted the data." });
        } catch (e) {
            console.log(e.message);
            return res.status(500).json({ message: e.message });
        }
    },
    generateArchimedesHistory: async (req, res) => {
        const inputDir = "./fileUploads/In/archimedes_history";
        const outputDir = "./fileUploads/out/archimedes_history";
        try {
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0, true);
            if (!data) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            await ArchimedesHistory.deleteMany({})
            for (let i = 0; i < data.length; i++) {
                const record = data[i];
                let amount = record["total"].replace(/,/g, '');
                if (amount.startsWith('(') && amount.endsWith(')')) {
                    amount = `-${amount.slice(1, -1)}`;
                }
                /* //get object id
                let archimedesid
                try {
                    archimedesid = await Archimedes.findOne({itemno: record["imageid"]})
                } catch (error) {
                    console.log(error);
                } 
                
                if (archimedesid === null){
                    
                }else{
                    //console.log(archimedesid._id);
                    
                }*/

                const result = await ArchimedesHistory.create({
                    "imageid": record["imageid"],
                    "location": record["location"],
                    "vendorname": record["vendorname"],
                    "document_type": record["document_type"],
                    "invoiceid": record["invoiceid"],
                    "invoicedate": record["invoicedate"],
                    "total": mongoose.Types.Decimal128.fromString(amount),
                    "scan_date": record["scan_date"],
                    "completedate": record["completedate"],
                    "stepname": record["stepname"],
                    "stepuser": record["stepuser"],
                    "begin_datetime": record["begin_datetime"],
                    "end_datetime": record["end_datetime"],
                    "durationdays": record["duration-days"]
                });

                
            }
            return res.status(200).json({ message: "Successfully inserted the data."});
        } catch (e) {
            console.log(e.message);
            return res.status(500).json({ message: e.message });
        }
    },




    generateSAPBKPF: async (req, res) => {
        const inputDir = "./fileUploads/rpa/in/SAP/BKPF";
        const outputDir = "./fileUploads/rpa/out/SAP/BKPF";
        try {
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0, true)
            if (!data) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            data.forEach(async (item) => {
                const result = await bkpf.create({
                    "companycode": item["Company Code"],
                    "documentnumber": item["Document Number"],
                    "documenttype": item["Document Type"],
                    "reference": item["Reversed with"],
                    "reversedwith": item["Reversed with"],
                    "docstatus": item["Doc"]["status"]
                })
            })
            return res.status(200).json({ message: "Successfully generated data." })
        } catch (e) {
            console.error(e)
            return res.status(500).json({ message: e.message });
        }
    },
    genereateSAPBSEG: async (req, res) => {
        const inputDir = "./fileUploads/rpa/in/SAP/BSEG";
        const outputDir = "./fileUploads/rpa/out/SAP/BSEG";
        try {
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0, true)
            if (!data || data.length === 0) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            data.forEach(async (item) => {
                const result = await bseg.create({
                    "companycode": item["Company Code"],
                    "documentnumber": item["Document Number"],
                    "lineitem": item["Line item"],
                    "postingkey": item["Posting Key"],
                    "taxcode": item["Tax code"],
                    "withholdingtaxcode": item["Withholding Tax Code"],
                    "amountinlc": item["Amount in LC"],
                    "profitcenter": item["Profit Center"],
                    "glaccount": item["G/L Account"]
                })
            })
            return res.status(200).json({ message: "Successfully generated data." })
        } catch (e) {
            console.error(e)
            return res.status(500).json({ message: e.message });
        }
    },
    generateSAPFB03: async (req, res) => {
        const inputDir = "./fileUploads/rpa/in/SAP/FB03";
        const outputDir = "./fileUploads/rpa/out/SAP/FB03";
        try {
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0, true)
            if (!data || data.length === 0) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            console.log("SAP SALES API COUNT: " + data.length)

            data.forEach(async (item) => {
            //Find BSEGS
                let BSEGS
                try {
                    BSEGS = await bseg.find({documentnumber: item["Document Number"]})
                    //console.log(BSEGS.length)
                    //console.log(Array.isArray(BSEGS));
                    //console.log(BSEGS);
                    //console.log(BSEGS.map(BSEGS => BSEGS._id));
                } catch (error) {
                    console.log(error);
                }

                if (BSEGS === null){
                    const result = await fb03.create({
                        "companycode": item["Company Code"],
                        "documentnumber": item["Document Number"],
                        "fiscalyear": item["Fiscal Year"],
                        "documenttype": item["Document Type"],
                        "documentdate": item["Document Date"],
                        "postingdate": item["Posting Date"],
                        "reference": item["Reference"],
                        "parkedby": item["Parked by"],
                        "doctype": item["Doc"]["Type"],
                        "reversedwith": item["Reversed with"],
                        "entrydate": item["Entry Date"],
                        "timeofentry": item["Time of Entry"]
                    })
                }else{
                    const objectIds = BSEGS.map(BSEGS => BSEGS._id); //BSEGS.map(bseg => BSEGS ? BSEGS._id : null);
                    //console.log(objectIds);
                    const result = await fb03.create({
                        "companycode": item["Company Code"],
                        "documentnumber": item["Document Number"],
                        "fiscalyear": item["Fiscal Year"],
                        "documenttype": item["Document Type"],
                        "documentdate": item["Document Date"],
                        "postingdate": item["Posting Date"],
                        "reference": item["Reference"],
                        "parkedby": item["Parked by"],
                        "doctype": item["Doc"]["Type"],
                        "reversedwith": item["Reversed with"],
                        "entrydate": item["Entry Date"],
                        "timeofentry": item["Time of Entry"],
                        "bseg" : objectIds
                    })
                }
            })
            
            


            return res.status(200).json({ message: "Successfully generated data." })
        } catch (e) {
            console.error(e)
            return res.status(500).json({ message: e.message });
        }
    },

    generateBankStatement: async (req, res) => {
        const inputDir = "./fileUploads/rpa/in/bankstatement";
        const outputDir = "./fileUploads/rpa/out/bankstatement";
        try{
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0, true);
            if (!data || data.length === 0) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            await bankstatement.deleteMany({})
            data.forEach(async (item) => {
                
                
                if(item["Pstng Date"] !== undefined){
                    const postingdate = dateFormat(item["Pstng Date"], "mm/dd/yyyy")
                    //console.log(postingdate)
                    const result = await bankstatement.create({
                        "companycode": item["CoCd"],
                        "valuedate": moment.tz(postingdate,'Asia/Taipei').utc().toDate(),
                        "glaccount": item["G/L"],
                        "amount": item["Amount in LC"].trim().replace(/,/g,""),
                        "crcy": item["Crcy"],
                        "costctr": item["Profit Ctr"],
                        "documentnumber": item["DocumentNo"],
                        "reference": item["Reference"],
                        "text": item["Text"]
                    })
                }
                

            })

            return res.status(200).json({message: "Successfully generated data."})
        }catch (e) {
            console.error(e);
            return res.status(500).json({messege: e.message});
        }

    },


    generateClearing: async (req,res) =>{ 
        const inputDir = "./fileUploads/rpa/in/clearing";
        const outputDir = "./fileUploads/rpa/out/clearing"; 
        try{
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0, true);
            if (!data || data.length === 0) {
                return res.status(400).json({ message: "No data found in the CSV folder." });
            }
            await bankstatement.deleteMany({})
            data.forEach(async (item) => {
                if(item["Pstng Date"] !== undefined){
                    const postingdate = dateFormat(item["Pstng Date"], "mm/dd/yyyy");
                    const documentdate = dateFormat(item["Doc"][" Date"], "mm/dd/yyyy");
                    const clearingdate = dateFormat(item["Clearing"], "mm/dd/yyyy");
                    const valuedate = dateFormat(item["Value Date"], "mm/dd/yyyy");

                    
                    const result = await clearing.create({
                        
                        "companycode" : item["CoCd"],
                        "DocumentDate" :moment.tz(documentdate,'Asia/Taipei').utc().toDate(),
                        "PostingDate" :moment.tz(postingdate,'Asia/Taipei').utc().toDate(),
                        "ClearingDate" :moment.tz(clearingdate,'Asia/Taipei').utc().toDate(),
                        "ValueDate" : moment.tz(valuedate,'Asia/Taipei').utc().toDate(),
                        "DocumentNumber" :item["DocumentNo"],
                        "ClearingDocument" : item["Clrng doc."],
                        "DocumentType" : item["Doc"][" Type"],
                        "Assignment" : item["Assignment"],
                        "Reference" : item["Reference"],
                        "Text" : item["Text"],
                        "AmountinLC" : item["Amount in LC"],
                        "Currency" : item["Curr."],
                        "CostCenter" : item["Cost Ctr"],
                        "ProfitCenter" : item["Profit Ctr"],
                        "GLAccount" : item["G/L"]

                    })
                }
            })
            return res.status(200).json({message: "Successfully generated data."})
        }catch (e) {
            console.log(e);
            return res.status(500).json({message: e.message});
        }
    }

}
export default generateController