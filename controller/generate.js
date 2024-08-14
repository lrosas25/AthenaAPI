import AP from "../model/AP.js"
import TreasuryClearing from "../model/TreasuryClearing.js";
import APSAP from "../model/APSAP.js";
import mongoose from "mongoose";
import processCSV from "../helpers/processCSV.js";
import processTreasury from "../helpers/processTreasury.js";
import processAllCSVFiles from "../helpers/processCSVFiles.js";
const generateController = {
    generateAP: async (req, res) => {
        const data = await processCSV();
        const POLineItemTotalData = []
        const POTotalData = []
        if (data && Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const record = data[i];
                // Check if the record is not empty or missing required properties
                // if (!record || Object.keys(record).length === 0 || !record["Amount in LC"]) {
                //     continue;
                // }
                if (POLineItemTotalData.length > 0) {
                    POLineItemTotalData.forEach((data) => {
                        if (data["Purch.Doc."] === record["Purch.Doc."]) {
                            data["AmountInLC"] = mongoose.Types.Decimal128.add(data["AmountInLC"], mongoose.Types.Decimal128.fromString(record["Amount in LC"]))
                        }
                    })
                } else {
                    POLineItemTotalData.push({
                        "purcDoc": record["Purch.Doc."],
                        "item": record["Item"],
                        "material": record["Material"],
                        "shortText": record["Short Text"],
                        "costCtr": record["Cost Ctr"],
                        "profitCtr": record["Profit Ctr"],
                        "AmountInLC": record["Amount in LC"]
                    })
                }

                //     // Clean and validate the strings
                //     const cleanedAmountString = record["Amount in LC"].replace(/[^0-9.]/g, '');
                //     const cleanedScheduledQty = record["Scheduled Qty"].replace(/[^0-9.]/g, '');
                //     const cleanedQtyDelivered = record["Qty Delivered"].replace(/[^0-9.]/g, '');
                //     const cleanedQuantityinOPUn = record["Quantity in OPUn"].replace(/[^0-9.]/g, '');
                //     const cleanedGRIRClearingValue = record["GR/IR clearing value in LC"]?.replace(/[^0-9.]/g, '');
                //     const cleanedQuantity = record["Quantity"].replace(/[^0-9.]/g, '');

                //     // Ensure the cleaned strings are valid Decimal128 values

                //     const amountInDecimal128 = mongoose.Types.Decimal128.fromString(cleanedAmountString);
                //     const scheduledQt = mongoose.Types.Decimal128.fromString(cleanedScheduledQty);
                //     const quantity = mongoose.Types.Decimal128.fromString(cleanedQuantity);
                //     const qtyDelivered = mongoose.Types.Decimal128.fromString(cleanedQtyDelivered);
                //     const quantityinOpu = mongoose.Types.Decimal128.fromString(cleanedQuantityinOPUn);
                //     const grIrClearingVal = cleanedGRIRClearingValue ? mongoose.Types.Decimal128.fromString(cleanedGRIRClearingValue) : null;
                //     try {
                const result = await AP.create({
                    "orderData": record["Order date"],
                    "delivDate": record["Deliv"][" Date"],
                    "purcDoc": record["Purch.Doc."],
                    "item": record.Item,
                    "material": record.Material,
                    "shortText": record["Short Text"],
                    "costCtr": record["Cost Ctr"],
                    "profitCtr": record["Profit Ctr"],
                    "scheduledQty": scheduledQt,
                    "oun": record["OUn"],
                    "qtyDelivered": qtyDelivered,
                    "quantity": quantity,
                    "QuantityinOPUn": quantityinOpu,
                    "OPU": record["OPU"],
                    "AmountInLC": amountInDecimal128,
                    "Crcy": record["Crcy"],
                    "HCt": record["HCt"],
                    "MvT": record["MvT"],
                    "D_C": record["D/C"],
                    "refDoc": record["Ref. Doc."],
                    "Vendor": record["Vendor"],
                    "Reference": record["Reference"],
                    "tx": record["Tx"],
                    "gl_acct": record["G/L Acct"],
                    "dci": record["DCI"],
                    "FIn": record["FIn"],
                    "documentNo": record["DocumentNo"],
                    "GrIrClearingValueInLC": grIrClearingVal,
                    "a": record["A"],
                });
                //     } catch (e) {
                //         return res.status(500).json({ message: e.message });
                //     }
            }
            return res.json({ message: "Successfully Inserted the data" });
        } else {
            return res.status(400).json({ message: "No data found in the CSV folder." });
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