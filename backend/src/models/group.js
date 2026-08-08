import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  },
  { timestamps: true },
);

groupSchema.index({ owner: 1 });
groupSchema.index({ members: 1 });

export const Group = mongoose.model("Group", groupSchema);
