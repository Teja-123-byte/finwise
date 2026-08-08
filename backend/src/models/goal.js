import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    target: { type: Number, required: true, min: 0.01 },
    saved: { type: Number, required: true, min: 0, default: 0 },
    deadline: { type: Date, required: true },
    color: { type: String, default: "var(--cat-education)" },
    note: { type: String, trim: true, maxlength: 220 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

goalSchema.index({ user: 1, deadline: 1 });

export const Goal = mongoose.model("Goal", goalSchema);
