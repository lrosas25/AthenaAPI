import mongoose from "mongoose"
import { Schema } from "mongoose"
const glDocTypeSchema = new Schema({
    glcode: {
        type: String
    },
    transactiondetails: {
        type: String
    },
    documentType: {
        type: String
    }
})

export default mongoose.model("GLDocType", glDocTypeSchema)