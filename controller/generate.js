import AP from "../model/AP.js"
import mongoose from "mongoose";
import processCSV from "../helpers/processCSV.js";
const generateController = {
    generateAP: async (req, res) => {
        await AP.deleteMany({});
        const data = await processCSV();

        if (data && Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const record = data[i];

                // Check if the record is not empty or missing required properties
                if (!record || Object.keys(record).length === 0 || !record["Amount in LC"] || !record["Scheduled Qty"] || !record["Qty Delivered"] || !record["Quantity in OPUn"] || !record["GR/IR clearing value in LC"] || !record["Quantity"]) {
                    continue;
                }

                // Clean and validate the strings
                const cleanedAmountString = record["Amount in LC"].replace(/[^0-9.]/g, '');
                const cleanedScheduledQty = record["Scheduled Qty"].replace(/[^0-9.]/g, '');
                const cleanedQtyDelivered = record["Qty Delivered"].replace(/[^0-9.]/g, '');
                const cleanedQuantityinOPUn = record["Quantity in OPUn"].replace(/[^0-9.]/g, '');
                const cleanedGRIRClearingValue = record["GR/IR clearing value in LC"].replace(/[^0-9.]/g, '');
                const cleanedQuantity = record["Quantity"].replace(/[^0-9.]/g, '');

                // Ensure the cleaned strings are valid Decimal128 values
                const isValidDecimal128String = (str) => /^-?\d+(\.\d+)?$/.test(str);

                if (!isValidDecimal128String(cleanedAmountString) ||
                    !isValidDecimal128String(cleanedScheduledQty) ||
                    !isValidDecimal128String(cleanedQtyDelivered) ||
                    !isValidDecimal128String(cleanedQuantityinOPUn) ||
                    !isValidDecimal128String(cleanedGRIRClearingValue) ||
                    !isValidDecimal128String(cleanedQuantity)) {
                    continue;
                }

                const amountInDecimal128 = mongoose.Types.Decimal128.fromString(cleanedAmountString);
                const scheduledQt = mongoose.Types.Decimal128.fromString(cleanedScheduledQty);
                const quantity = mongoose.Types.Decimal128.fromString(cleanedQuantity);
                const qtyDelivered = mongoose.Types.Decimal128.fromString(cleanedQtyDelivered);
                const quantityinOpu = mongoose.Types.Decimal128.fromString(cleanedQuantityinOPUn);
                try {
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
                        "GrIrClearingValueInLC": record["GR/IR clearing value in LC"],
                        "a": record["A"],
                    });
                } catch (e) {
                    return res.status(500).json({ message: e.message });
                }
            }
            return res.json({ message: "Successfully Inserted the data" });
        } else {
            return res.status(400).json({ message: "No data found in the CSV folder." });
        }
    },
    generateAR: (req, res) => {

    },
}
export default generateController