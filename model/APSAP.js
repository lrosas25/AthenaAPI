import mongoose from "mongoose";
import { Schema } from "mongoose";

const AP_SAPSchema = new Schema({
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
    reference: {
        type: String
    },
    documentno: {
        type: String
    },
    pstngdate: {
        type: String
    },
    grossamt: {
        type: mongoose.Decimal128,
    },
    crcy: {
        type: String
    }
})

export default mongoose.model("AP_SAP", AP_SAPSchema)