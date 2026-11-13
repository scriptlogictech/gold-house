const mongoose = require("mongoose");

const PRODUCT_CATEGORIES = ["Gold", "Diamond", "Silver", "NKM Nosepins"];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
      maxlength: 180,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 220,
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 80,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Product category is required."],
      enum: PRODUCT_CATEGORIES,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) =>
          Array.isArray(images) &&
          images.length <= 12 &&
          images.every((url) => typeof url === "string" && url.trim()),
        message: "Provide up to 12 valid image URLs.",
      },
    },
    metal: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    purity: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    grossWeight: {
      type: Number,
      min: 0,
      default: null,
    },
    netWeight: {
      type: Number,
      min: 0,
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    showOnWebsite: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", sku: "text" });
productSchema.index({ category: 1, isActive: 1, showOnWebsite: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
module.exports.PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;
