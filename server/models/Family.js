
const mongoose = require("mongoose");

const familySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Family name is required"],
      trim: true,
      maxlength: 150,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    headId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Family head is required"],
    },

    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
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
  { timestamps: true }
);

familySchema.index({ name: 1 });
familySchema.index({ headId: 1 });
familySchema.index({ memberIds: 1 });

module.exports = mongoose.model("Family", familySchema);
