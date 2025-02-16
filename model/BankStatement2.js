import mongoose from "mongoose";
import { Schema } from "mongoose";

const BankStatementSchema = new Schema({
    companycode: {
        type:String
    },
    valuedate:{
        type:String 
    },
    glaccount:{
        type: String
    },
    amount:{
        type: mongoose.Decimal128
    },
    crcy:{
        type: String
    },
    costctr:{
        type: String
    }
})

export const bankstatement = mongoose.model("bankstatements", BankStatementSchema);