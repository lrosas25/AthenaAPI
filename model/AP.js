import mongoose from "mongoose";
import { Schema } from "mongoose";

const APSchema = new Schema({
    orderDate: {
        type: String,
    },
    delivDate: {
        type: String,
    },
    purcDoc: {
        type: String,
    },
    item: {
        type: String,
    },
    material: {
        type: String,
    },
    shortText: {
        type: String,
    },
    costCtr: {
        type: String,
    },
    profitCtr: {
        type: String,
    },
    scheduledQty: {
        type: mongoose.Decimal128,
    },
    oun: {
        type: String,
    },
    qtyDelivered: {
        type: mongoose.Decimal128,
    },
    quantity: {
        type: mongoose.Decimal128,
    },
    QuantityinOPUn: {
        type: mongoose.Decimal128,
    },
    OPU: {
        type: String,
    },
    AmountInLC: {
        type: mongoose.Decimal128,
    },
    Crcy: {
        type: String,
    },
    HCt: {
        type: String,
    },
    MvT: {
        type: String,
    },
    D_C: {
        type: String,
    },
    refDoc: {
        type: String,
    },
    Vendor: {
        type: String,
    },
    Reference: {
        type: String,
    },
    tx: {
        type: String,
    },
    gl_acct: {
        type: String,
    },
    dci: {
        type: String,
    },
    FIn: {
        type: String,
    }
})

export default mongoose.model('Ap', APSchema);

