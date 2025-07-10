import mongoose from "mongoose";
import { Schema } from "mongoose";

const bsegSchema = new Schema({
    companycode: {
        type: String
    },
    documentnumber: {
        type: String
    },
    lineitem: {
        type: String
    },
    postingkey: {
        type: String
    },
    taxcode: {
        type: String
    },
    withholdingtaxcode: {
        type: String
    },
    amountinlc: {
        type: String
    },
    glaccount: {
        type: String
    },
    profitcenter: {
        type: String
    }
})

export const bseg = mongoose.model('bseg', bsegSchema)