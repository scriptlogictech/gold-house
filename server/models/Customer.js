
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // Unique ID from your existing billing software
    externalCustomerId: {
      type: String,
      trim: true,
      default: null,
    },

    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      trim: true,
      required: [true, "Customer phone number is required"],
      maxlength: 25,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    source: {
      type: String,
      enum: ["manual", "billing_import"],
      default: "manual",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "Gold Buyer",
        "Diamond Buyer",
        "Silver Buyer",
        "Wedding Customer",
        "VIP",
      ],
      default: "Gold Buyer",
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

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

// Unique billing-software ID when provided.
// Multiple records without an external ID are allowed.
customerSchema.index(
  { externalCustomerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      externalCustomerId: { $type: "string" },
    },
  }
);

// Efficient customer search and phone lookup.
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 1 });

module.exports = mongoose.model("Customer", customerSchema);
