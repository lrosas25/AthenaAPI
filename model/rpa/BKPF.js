import mongoose from "mongoose";
import { Schema } from "mongoose";

const bkpfSchema = new Schema({
    companycode: {
        type: String
    },
    documentnumber: {
        type: String
    },
    documenttype: {
        type: String
    },
    reference: {
        type: String
    },
    reversedwith: {
        type: String
    },
    docstatus: {
        type: String
    }
})

export const bkpf = mongoose.model('bkpf', bkpfSchema)