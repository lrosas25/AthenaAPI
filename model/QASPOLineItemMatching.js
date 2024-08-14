import mongoose from "mongoose";
import { Schema } from "mongoose";

const POLineItemTotalSchema = new Schema({
    purchDoc: {
        type: String
    },
    item: {
        type: String
    },
    material: {
        type: String
    },
    shortText: {
        type: String
    },
    costCtr: {
        type: String
    },
    profitCtr: {
        type: String
    },
    amountInLC: {
        type: mongoose.Decimal128,
    }
})

export default mongoose.model("QASPOLineItemTotal", POLineItemTotalSchema)