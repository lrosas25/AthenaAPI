import mongoose from "mongoose";
import { Schema } from "mongoose";


const BankStatementSchema = new Schema({
    companycode: {
        type:String
    },
    valuedate:{
        type: Date
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
    },
    documentnumber:{
        type: String
    },
    reference:{
        type: String
    },
    text:{
        type: String
    }
})

export default mongoose.model("bankstatements", BankStatementSchema);