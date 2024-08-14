import mongoose from "mongoose";
import { Schema } from "mongoose";

const TreasuryClearingSchema = new Schema({
    pk: {
        type: String
    },
    cocd: {
        type: String
    },
    clringDoc: {
        type: String
    },
    documentNo: {
        type: String
    },
    AmountInLC: {
        type: mongoose.Decimal128,
    },
    crcy: {
        type: String
    },
    clearing: {
        type: String
    },
    HouseBk: {
        type: String
    }

})

export default mongoose.model("TreasuryClearing", TreasuryClearingSchema);