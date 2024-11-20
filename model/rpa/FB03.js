import mongoose from "mongoose";
import { Schema } from "mongoose";

const fb03Schema = new Schema({
    companycode: {
        type: String
    },
    documentnumber: {
        type: String
    },
    fiscalyear: {
        type: String
    },
    documenttype: {
        type: String
    },
    documentdate: {
        type: String
    },
    postingdate: {
        type: String
    },
    reference: {
        type: String
    },
    parkedby: {
        type: String
    },
    doctype: {
        type: String
    },
    reversedwith: {
        type: String
    },
    entrydate: {
        type: String
    },
    timeofentry: {
        type: String
    },
    bseg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bsegs'
    } 
})

export const fb03 = mongoose.model('fb03', fb03Schema)