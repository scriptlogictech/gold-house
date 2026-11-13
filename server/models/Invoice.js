
const mongoose = require("mongoose");

const invoiceLineSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    sku: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    quantity: {
      type: Number,
      min: 0,
      default: 1,
    },

    unitPricePaise: {
      type: Number,
      min: 0,
      default: 0,
    },

    amountPaise: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    // Invoice identification
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    source: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    sourceInvoiceId: {
      type: String,
      trim: true,
      default: null,
      maxlength: 150,
    },

    // Customer and family references
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    family: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      default: null,
      index: true,
    },

    // Invoice date and currency
    invoiceDate: {
      type: Date,
      required: true,
      index: true,
    },

    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },

    // Invoice amounts (stored in paise)
    totalAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },

    eligibleAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },

    // Invoice products
    lineItems: {
      type: [invoiceLineSchema],
      default: [],
    },

    // Invoice lifecycle
    status: {
      type: String,
      enum: ["pending", "posted", "returned", "cancelled"],
      default: "pending",
      index: true,
    },

    // Cancellation details
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Import tracking
    importJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImportJob",
      default: null,
    },

    // User tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate invoice numbers from the same billing source.
invoiceSchema.index(
  { source: 1, invoiceNumber: 1 },
  {
    unique: true,
    name: "unique_source_invoice_number",
  }
);

// Billing source invoice lookup.
invoiceSchema.index({
  source: 1,
  sourceInvoiceId: 1,
});

// Customer invoice history.
invoiceSchema.index({
  customer: 1,
  invoiceDate: -1,
});

// Family invoice history.
invoiceSchema.index({
  family: 1,
  invoiceDate: -1,
});

// Invoice status and date filtering.
invoiceSchema.index({
  status: 1,
  invoiceDate: -1,
});

module.exports = mongoose.model("Invoice", invoiceSchema);
