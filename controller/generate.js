import AP from "../model/AP.js"
import mongoose from "mongoose";
import processCSV from "../helpers/processCSV.js";
const generateController = {
    generateAP: async (req, res) => {
        const data = await processCSV()
        if (data) {
            for (let i = 0; i < data.length; i++) {
                const cleanedAmountString = data[i]["Amount in LC"].replace(/[^0-9.]/g, '');
                const cleanedScheduledQty = data[i]["Scheduled Qty"].replace(/[^0-9.]/g, '');
                const cleanedQtyDelivered = data[i]["Qty Delivered"].replace(/[^0-9.]/g, '');
                const cleanedQuantityinOPUn = data[i]["Quantity in OPUn"].replace(/[^0-9.]/g, '');
                const cleanedQuantity = data[i]["quantity"].replace(/[^0-9.]/g, '');
                const amountInDecimal128 = mongoose.Types.Decimal128.fromString(cleanedAmountString);
                const scheduledQt = mongoose.Types.Decimal128.fromString(cleanedScheduledQty);
                const quantity = mongoose.Types.Decimal128.fromString(cleanedQuantity);
                const qtyDelivered = mongoose.Types.Decimal128.fromString(cleanedQtyDelivered);
                const quantityinOpu = mongoose.Types.Decimal128.fromString(cleanedQuantityinOPUn);
                try {
                    const result = await AP.create({
                        "orderData": data[i]["Order date"],
                        "delivDate": data[i]["Deliv"][" Date"],
                        "purcDoc": data[i]["Purch.Doc."],
                        "item": data[i].Item,
                        "material": data[i].Material,
                        "shortText": data[i]["Short Text"],
                        "costCtr": data[i]["Cost Ctr"],
                        "profitCtr": data[i]["Profit Ctr"],
                        "scheduledQty": scheduledQt,
                        "oun": data[i]["OUn"],
                        "qtyDelivered": qtyDelivered,
                        "quantity": quantity,
                        "QuantityinOPUn": quantityinOpu,
                        "OPU": data[i]["OPU"],
                        "AmountInLC": amountInDecimal128,
                        "Crcy": data[i]["Crcy"],
                        "HCt": data[i]["HCt"],
                        "MvT": data[i]["MvT"],
                        "D_C": data[i]["D/C"],
                        "refDoc": data[i]["Ref. Doc."],
                        "Vendor": data[i]["Vendor"],
                        "Reference": data[i]["Reference"],
                        "tx": data[i]["Tx"],
                        "gl_acct": data[i]["G/L Acct"],
                        "dci": data[i]["DCI"],
                        "FIn": data[i]["FIn"]
                    })
                } catch (e) {
                    return res.status(500).json({ message: e.message })
                }
            }
            return res.json({ message: "Succesfully Inserted the data" })
        } else {
            return res.status(400).json({ message: "No data found in the CSV folder." })
        }

    },
    generateAR: (req, res) => {

    }
}
export default generateController