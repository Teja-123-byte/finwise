import mongoose from "mongoose";

const splitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    label: { type: String, required: true, trim: true, maxlength: 140 },
    amount: { type: Number, required: true, min: 0.01 },
    paidBy: { type: String, required: true, trim: true, maxlength: 80 },
    among: [{ type: String, trim: true, maxlength: 80 }],
    date: { type: Date, required: true },
    note: { type: String, trim: true, maxlength: 220 },
    settled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

splitSchema.index({ user: 1, date: -1 });

export const Split = mongoose.model("Split", splitSchema);
