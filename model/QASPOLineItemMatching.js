import mongoose from "mongoose";
import { Schema } from "mongoose";

const polineitemtotalschema = new Schema({
    purchdoc: {
        type: String
    },
    item: {
        type: String
    },
    material: {
        type: String
    },
    shorttext: {
        type: String
    },
    costctr: {
        type: String
    },
    profitctr: {
        type: String
    },
    amountinlc: {
        type: mongoose.Decimal128,
    }
});

export default mongoose.model("Qaspolineitemtotal", polineitemtotalschema);