import { Router } from "express";
import { Split } from "../models/split.js";
import { Group } from "../models/group.js";
import { requireAuth } from "../middleware/auth.js";

export const splitsRouter = Router();
splitsRouter.use(requireAuth);

splitsRouter.get("/", async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user.sub }).select("_id");
    const groupIds = groups.map((group) => group._id);
    const splits = await Split.find({ group: { $in: groupIds } }).sort({ date: -1, createdAt: -1 });
    res.json(splits.map((split) => ({ ...split.toObject(), id: split._id.toString() })));
  } catch (error) {
    next(error);
  }
});

splitsRouter.post("/", async (req, res, next) => {
  try {
    const { label, amount, paidBy, among, date, note, settled } = req.body;
    const groupId = req.body.groupId ?? req.body.group;
    if (!label?.trim() || !amount || !paidBy?.trim() || !Array.isArray(among) || among.length === 0 || !date || !groupId) {
      return res.status(400).json({ message: "Label, amount, payer, participants, date, and group are required." });
    }

    const group = await Group.findOne({ _id: groupId, members: req.user.sub });
    if (!group) {
      return res.status(403).json({ message: "You must belong to the selected group." });
    }

    const split = await Split.create({
      user: req.user.sub,
      group: group._id,
      label: label.trim(),
      amount: Number(amount),
      paidBy: paidBy.trim(),
      among: among.map((member) => String(member).trim()).filter(Boolean),
      date: new Date(date),
      note: note?.trim() ?? "",
      settled: Boolean(settled),
    });

    res.status(201).json({ ...split.toObject(), id: split._id.toString() });
  } catch (error) {
    next(error);
  }
});

splitsRouter.patch("/:id", async (req, res, next) => {
  try {
    const split = await Split.findById(req.params.id);
    if (!split) return res.status(404).json({ message: "Split not found." });
    const group = await Group.findOne({ _id: split.group, members: req.user.sub });
    if (!group) return res.status(403).json({ message: "Not authorized to modify this split." });

    const allowed = ["label", "amount", "paidBy", "among", "date", "note", "settled"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    Object.assign(split, update);
    await split.save();
    res.json({ ...split.toObject(), id: split._id.toString() });
  } catch (error) {
    next(error);
  }
});

splitsRouter.delete("/:id", async (req, res, next) => {
  try {
    const split = await Split.findById(req.params.id);
    if (!split) return res.status(404).json({ message: "Split not found." });
    const group = await Group.findOne({ _id: split.group, members: req.user.sub });
    if (!group) return res.status(403).json({ message: "Not authorized to delete this split." });
    await split.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
