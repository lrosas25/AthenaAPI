import mongoose from "mongoose";
import { Schema } from "mongoose";

const ArchimedesHistorySchema = new Schema({
    imageid: {
        type: String
    },
    location: {
        type: String
    },
    vendorname: {
        type: String
    },
    document_type: {
        type: String
    },
    invoiceid: {
        type: String
    },
    invoicedate: {
        type: String
    },
    total: {
        type: mongoose.Decimal128
    },
    scan_date: {
        type: String
    },
    completedate: {
        type: String
    },
    stepname: {
        type: String
    },
    stepuser: {
        type: String
    },
    begin_datetime: {
        type: String
    },
    end_datetime: {
        type: String
    },
    durationdays: {
        type: String
    }
})

export default mongoose.model("archimedes_histories", ArchimedesHistorySchema);