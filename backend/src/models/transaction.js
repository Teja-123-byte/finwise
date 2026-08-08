import mongoose from "mongoose";

const categories = [
  "food", "rent", "transport", "education", "entertainment", "shopping",
  "subscriptions", "health", "other", "allowance", "stipend", "freelance",
];

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    note: { type: String, required: true, trim: true, maxlength: 160 },
    amount: { type: Number, required: true, min: 0.01 },
    kind: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, enum: categories, required: true },
    date: { type: Date, required: true },
    classification: {
      source: { type: String, enum: ["ml-lite", "manual"], default: "manual" },
      confidence: { type: Number, min: 0, max: 1, default: 1 },
    },
  },
  { timestamps: true },
);

transactionSchema.index({ user: 1, date: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
