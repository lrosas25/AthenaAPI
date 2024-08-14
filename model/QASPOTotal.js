import mongoose from "mongoose";
import { Schema } from "mongoose";

const POTotal = new Schema({
    purchDoc: {
        type: String
    },
    totalAmountInLC: {
        type: mongoose.Decimal128,
    }
})
export default mongoose.model("QASPOTotal", POTotal)