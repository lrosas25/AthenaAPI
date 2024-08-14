import mongoose from "mongoose";
import { Schema } from "mongoose";

const POTotal = new Schema({
    purchdoc: {
        type: String
    },
    totalamountinlc: {
        type: mongoose.Decimal128,
    }
})
export default mongoose.model("QASPOTotal", POTotal)