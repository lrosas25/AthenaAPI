import mongoose from "mongoose";
import { Schema } from "mongoose";

const POLineItemTotalSchema = new Schema({
    PurchDoc: {
        type: String
    },
    Item: {
        type: String
    },
    Material: {
        type: String
    },
    ShortText: {
        type: String
    },
    CostCtr: {
        type: String
    },
    ProfitCtr: {
        type: String
    },
    AmountInLC: {
        type: mongoose.Decimal128,
    }
})

export default mongoose.model("QASPOLineItemTotal", POLineItemTotalSchema)