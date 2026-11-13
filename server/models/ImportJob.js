
const mongoose = require("mongoose");

const importJobSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    fileName: {
      type: String,
      trim: true,
      maxlength: 255,
      default: "",
    },

    status: {
      type: String,
      enum: ["previewed", "completed", "failed"],
      default: "previewed",
      index: true,
    },

    totalRows: { type: Number, default: 0, min: 0 },
    validRows: { type: Number, default: 0, min: 0 },
    importedRows: { type: Number, default: 0, min: 0 },
    duplicateRows: { type: Number, default: 0, min: 0 },
    rejectedRows: { type: Number, default: 0, min: 0 },

    // Temporary normalized data used by the preview/confirm workflow.
    rows: { type: [mongoose.Schema.Types.Mixed], default: [] },

    errors: {
      type: [
        {
          row: Number,
          invoiceNumber: String,
          message: String,
        },
      ],
      default: [],
    },

    startedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImportJob", importJobSchema);
