import mongoose from "mongoose";
import { Schema } from "mongoose";

const TreasuryClearingSchema = new Schema({
    pk: {
        type: String
    },
    cocd: {
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
    Housebk: {
        type: String
    }

})

export default mongoose.model("TreasuryClearing", TreasuryClearingSchema);