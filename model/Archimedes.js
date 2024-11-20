import mongoose from "mongoose";
import { Schema } from "mongoose";

const ArchimedesSechema = new Schema({
    company: {
        type: String
    },
    itemno: {
        type: String
    },
    location: {
        type: String
    },
    vendor: {
        type: String
    },
    documenttype: {
        type: String
    },
    documentno: {
        type: String
    },
    documentdate: {
        type: String
    },
    pono: {
        type: String
    },
    amount: {
        type: mongoose.Decimal128
    },
    currency: {
        type: String
    },
    status: {
        type: String
    },
    inbox: {
        type: String
    },
    statusdate: {
        type: String
    },
    voucherno: {
        type: String
    },
    file: {
        type: String
    },
    documenttype1: {
        type: String
    },
    category: {
        type: String
    },
    priority: {
        type: String
    },
    duedate: {
        type: String
    },
    history: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'archimedes_histories'
    } 
})

export default mongoose.model("Archimedes", ArchimedesSechema);