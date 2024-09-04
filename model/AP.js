import mongoose from "mongoose";
import { Schema } from "mongoose";

const APSchema = new Schema({
    orderdate: {
        type: String,
    },
    delivdate: {
        type: String,
    },
    cocd: {
        type: String
    },
    purcdoc: {
        type: String,
    },
    item: {
        type: String,
    },
    material: {
        type: String,
    },
    valcl: {
        type: String
    },
    shorttext: {
        type: String,
    },
    costctr: {
        type: String,
    },
    profitctr: {
        type: String,
    },
    scheduledqty: {
        type: mongoose.Decimal128,
    },
    oun: {
        type: String,
    },
    qtydelivered: {
        type: mongoose.Decimal128,
    },
    quantity: {
        type: mongoose.Decimal128,
    },
    quantityinopun: {
        type: mongoose.Decimal128,
    },
    opu: {
        type: String,
    },
    amountinlc: {
        type: mongoose.Decimal128,
    },
    crcy: {
        type: String,
    },
    hct: {
        type: String,
    },
    mvt: {
        type: String,
    },
    d_c: {
        type: String,
    },
    matdoc: {
        type: String
    },
    refdoc: {
        type: String,
    },
    vendor: {
        type: String,
    },
    reference: {
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
    fin: {
        type: String,
    },
    documentno: {
        type: String,
    },
    grirclearingvalueinlc: {
        type: mongoose.Decimal128,
    },
    a: {
        type: String
    },
    name1: {
        type: String
    },
    name2: {
        type: String
    },
    salesperson: {
        type: String
    },
    telephone: {
        type: String
    },
    taxnumber1: {
        type: String
    },
    doctype: {
        type: String
    },
    companyname: {
        type: String
    }
});

export default mongoose.model('Ap', APSchema);