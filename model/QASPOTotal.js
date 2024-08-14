import mongoose from "mongoose";
import { Schema } from "mongoose";

const POTotal = new Schema({
    PurchDoc: {
        type: String
    },
    TotalAmountInLC: {
        type: mongoose.Decimal128,
    }
})
export default mongoose.model("QASPOTotal", POTotal)