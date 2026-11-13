
const mongoose = require("mongoose");

const invoiceReturnSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    amountPaise: {
      type: Number,
      required: true,
      min: 1,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    returnedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Prevent duplicate return requests
    idempotencyKey: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

invoiceReturnSchema.index({
  invoice: 1,
  createdAt: -1,
});

invoiceReturnSchema.index(
  {
    invoice: 1,
    idempotencyKey: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: {
        $type: "string",
      },
    },
  }
);

module.exports = mongoose.model(
  "InvoiceReturn",
  invoiceReturnSchema
);
