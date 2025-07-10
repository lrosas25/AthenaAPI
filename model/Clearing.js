import mongoose from "mongoose";
import { Schema } from "mongoose";

const clearing = new Schema({
    companycode: {
        type:String
    },
    DocumentDate:{
        type:Date
    },
    PostingDate: {
        type:Date
    },
    ClearingDate: {
        type:Date
    },
    ValueDate: {
        type:Date
    },
    DocumentNumber: {
        type: String
    },
    ClearingDocument: {
        type:String
    },
    DocumentType: {
        type:String
    },
    Assignment: {
        type:String
    },
    Reference: {
        type:String
    },
    Text:{
        type:String
    },
    AmountinLC: {
        type:String
    },
    Currency:{
        type:String
    },
    CostCenter:{
        type:String
    },
    ProfitCenter:{
        type:String
    },
    GLAccount:{
        type:String
    }


})
export default mongoose.model("clearings", clearing);