import AP from "../model/AP.js"
import TreasuryClearing from "../model/TreasuryClearing.js";
import APSAP from "../model/APSAP.js";
import QASPOLineItemMatching from "../model/QASPOLineItemMatching.js";
import QASPOTotal from "../model/QASPOTotal.js";
import mongoose from "mongoose";
import processCSV from "../helpers/processCSV.js";
import processTreasury from "../helpers/processTreasury.js";
import processAllCSVFiles from "../helpers/processCSVFiles.js";
const generateController = {
    generateAP: async (req, res) => {
        const inputDir = "./fileUploads/In/ap";
        const outputDir = "./fileUploads/out/ap";
        const POLineItemTotalData = [];
        const POTotalData = [];
        try {
            // Process all CSV files in the input directory
            await AP.deleteMany({})
            await QASPOLineItemMatching.deleteMany({})
            await QASPOTotal.deleteMany({})
            const data = await processAllCSVFiles(inputDir, outputDir, 4, 6);
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
                    const result = await AP.create({
                        "orderData": item["Order date"],
                        "delivDate": item["Deliv"][" Date"],
                        "cocd": item["CoCd"],
                        "purcDoc": item["Purch.Doc."],
                        "item": item.Item,
                        "material": item.Material,
                        "shortText": item["Short Text"],
                        "costCtr": item["Cost Ctr"],
                        "profitCtr": item["Profit Ctr"],
                        "scheduledQty": scheduledQt,
                        "oun": item["OUn"],
                        "qtyDelivered": qtyDelivered,
                        "quantity": quantity,
                        "QuantityinOPUn": quantityinOpu,
                        "OPU": item["OPU"],
                        "AmountInLC": amountInDecimal128,
                        "Crcy": item["Crcy"],
                        "HCt": item["HCt"],
                        "MvT": item["MvT"],
                        "D_C": item["D/C"],
                        "matDoc": item["Mat. Doc."],
                        "refDoc": item["Ref. Doc."],
                        "Vendor": item["Vendor"],
                        "Reference": item["Reference"],
                        "tx": item["Tx"],
                        "gl_acct": item["G/L Acct"],
                        "dci": item["DCI"],
                        "FIn": item["FIn"],
                        "documentNo": item["DocumentNo"],
                        "GrIrClearingValueInLC": grIrClearingVal,
                        "a": item["A"],
                    });
                } catch (e) {
                    console.log(e.message);
                }
            });
            POLineItemTotalData.forEach(async (item) => {
                try {
                    await QASPOLineItemMatching.create({
                        "PurchDoc": item.purcDoc,
                        "Item": item.item,
                        "Material": item.material,
                        "ShortText": item.shortText,
                        "CostCtr": item.costCtr,
                        "ProfitCtr": item.profitCtr,
                        "AmountInLC": mongoose.Types.Decimal128.fromString(item.amountInLC.toString())
                    });
                } catch (e) {
                    console.log(e);
                }
            })
            POTotalData.forEach(async (item) => {
                try {
                    await QASPOTotal.create({
                        "PurchDoc": item.purcDoc,
                        "TotalAmountInLC": mongoose.Types.Decimal128.fromString(item.totalAmountInLC.toString())
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
            for (let i = 0; i < data.length; i++) {
                const record = data[i];
                try {
                    const amountInLC = record["Amount in LC"].replace(/,/g, '');  // Remove commas from the string

                    const result = await TreasuryClearing.create({
                        pk: record["PK"],
                        cocd: record["CoCd"],
                        documentNo: record["DocumentNo"],
                        clringDoc: record["Clrng Doc."],
                        AmountInLC: mongoose.Types.Decimal128.fromString(amountInLC),  // Convert to Decimal128
                        crcy: record["Crcy"],
                        clearing: record["Clearing"],
                        HouseBk: record["House Bk"] ? record["House Bk"] : ""
                    });
                } catch (e) {
                    console.log(e);  // Log the full error object
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
            console.log(data)
            for (let i = 0; i < data.length; i++) {
                const record = data[i]
                try {
                    const amountInLC = record["Amount in LC"].replace(/,/g, '');
                    const result = await APSAP.create({
                        "cocd": record["CoCd"],
                        "vendor": record["Vendor"],
                        "name1": record["Name 1"],
                        "name2": record["Name 2"],
                        "reference": record["Reference"],
                        "documentNo": record["DocumentNo"],
                        "pstngDate": record["Pstng Date"],
                        "AmountInLC": mongoose.Types.Decimal128.fromString(amountInLC),
                        "crcy": record["Crcy"] ? record["Crcy"] : ""
                    })
                    return res.status(200).json({ message: "Data created successfully." })
                } catch (e) {
                    console.log(e.message)
                }
            }
            return res.status(200).json({ message: "Successfully Generated" })
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    }
}
export default generateController