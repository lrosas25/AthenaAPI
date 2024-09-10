import mongoose from "mongoose";
import { Schema } from "mongoose";

const TreasuryClearingSchema = new Schema({
    // pk: {
    //     type: String
    // },
    cocd: {
        type: String
    },
    vendor: {
        type: String
    },
    name1: {
        type: String
    },
    name2: {
        type: String
    },
    clringdoc: {
        type: String
    },
    documentno: {
        type: String
    },
    amountinlc: {
        type: mongoose.Decimal128,
    },
    crcy: {
        type: String
    },
    clearing: {
        type: String
    },
    housebk: {
        type: String
    }

})

export default mongoose.model("TreasuryClearing", TreasuryClearingSchema);