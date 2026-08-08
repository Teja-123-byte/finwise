import { Router } from "express";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";

export const groupsRouter = Router();
groupsRouter.use(requireAuth);

groupsRouter.get("/", async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user.sub }).populate("members", "name email").sort({ createdAt: -1 });
    res.json(groups.map((group) => ({
      id: group._id.toString(),
      name: group.name,
      members: group.members.map((member) => ({ id: member.id, name: member.name, email: member.email })),
      createdAt: group.createdAt,
    })));
  } catch (error) {
    next(error);
  }
});

groupsRouter.post("/", async (req, res, next) => {
  try {
    const { name, memberIds } = req.body;
    if (!name?.trim() || !Array.isArray(memberIds)) {
      return res.status(400).json({ message: "Group name and member IDs are required." });
    }
    const allMemberIds = Array.from(new Set([req.user.sub, ...memberIds].map(String)));
    const members = await User.find({ _id: { $in: allMemberIds } }).select("name email");
    if (members.length !== allMemberIds.length) {
      return res.status(400).json({ message: "One or more selected users do not exist." });
    }
    const group = await Group.create({ owner: req.user.sub, name: name.trim(), members: allMemberIds });
    res.status(201).json({
      id: group._id.toString(),
      name: group.name,
      members: members.map((member) => ({ id: member.id, name: member.name, email: member.email })),
      createdAt: group.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

groupsRouter.get("/search", async (req, res, next) => {
  try {
    const query = String(req.query.q ?? "").trim();
    if (!query) {
      return res.json([]);
    }
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }],
      _id: { $ne: req.user.sub },
    }).limit(20).select("name email");
    res.json(users.map((user) => ({ id: user.id, name: user.name, email: user.email })));
  } catch (error) {
    next(error);
  }
});
