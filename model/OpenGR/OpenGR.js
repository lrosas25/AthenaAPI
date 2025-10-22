import mongoose from "mongoose";
import { Schema } from "mongoose";

const OpenGRSchema = new Schema(
  {
    companyCode: {
      type: String,
      required: true,
    },
    vendorNumber: {
      type: String,
      required: true,
    },
    vendorName: {
      type: String,
    },
    purchaseOrderNumber: {
      type: String,
    },
    poItemNumber: {
      type: String,
    },
    documentType: {
      type: String,
    },
    poLineDescription: {
      type: String,
    },
    poDate: {
      type: String,
    },
    plant: {
      type: String,
    },
    sesNumber: {
      type: String,
    },
    sesItemNumber: {
      type: String,
    },
    sesShortText: {
      type: String,
    },
    quantity: {
      type: mongoose.Decimal128,
    },
    uom: {
      type: String,
    },
    netValue: {
      type: mongoose.Decimal128,
    },
    amountInLC: {
      type: mongoose.Decimal128,
    },
    taxCode: {
      type: String,
    },
    goodReceipt: {
      type: String,
    },
    grAccountingDoc: {
      type: String,
    },
    costCenter: {
      type: String,
    },
    profitCenter: {
      type: String,
    },
    createdBy: {
      type: String,
    },
    creationDate: {
      type: String,
    },
    sourceFile: {
      type: String,
    },
    processedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("OpenGR", OpenGRSchema, "gr_irs");
