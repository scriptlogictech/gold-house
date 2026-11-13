
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: ["payment", "refund"],
      required: true,
      index: true,
    },

    amountPaise: {
      type: Number,
      required: true,
      min: 1,
    },

    method: {
      type: String,
      enum: ["cash", "upi", "card", "bank_transfer", "other"],
      required: true,
    },

    transactionReference: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    paidAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    originalPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // Refund classification
    refundCategory: {
      type: String,
      enum: [
        "merchandise_return",
        "billing_correction",
        "goodwill",
        null,
      ],
      default: null,
    },

    // Refund approval workflow
    approvalStatus: {
      type: String,
      enum: [
        "not_required",
        "pending",
        "approved",
        "rejected",
      ],
      default: "not_required",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Prevent duplicate financial requests
    idempotencyKey: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
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

// Indexes
paymentSchema.index({
  invoice: 1,
  createdAt: -1,
});

paymentSchema.index({
  customer: 1,
  createdAt: -1,
});

paymentSchema.index({
  originalPayment: 1,
});

// Unique key per invoice, only when a key is supplied.
paymentSchema.index(
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

module.exports = mongoose.model("Payment", paymentSchema);
