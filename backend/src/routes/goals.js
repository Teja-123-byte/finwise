import { Router } from "express";
import { Goal } from "../models/goal.js";
import { requireAuth } from "../middleware/auth.js";

export const goalsRouter = Router();
goalsRouter.use(requireAuth);

goalsRouter.get("/", async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.sub }).sort({ deadline: 1, createdAt: -1 });
    res.json(goals.map((goal) => ({ ...goal.toObject(), id: goal._id.toString() })));
  } catch (error) {
    next(error);
  }
});

goalsRouter.post("/", async (req, res, next) => {
  try {
    const { name, target, saved = 0, deadline, color, note } = req.body;
    if (!name?.trim() || !deadline || !target || Number(target) <= 0) {
      return res.status(400).json({ message: "Goal name, target, and deadline are required." });
    }

    const goal = await Goal.create({
      user: req.user.sub,
      name: name.trim(),
      target: Number(target),
      saved: Number(saved),
      deadline: new Date(deadline),
      color: color ?? "var(--cat-education)",
      note: note?.trim() ?? "",
    });

    res.status(201).json({ ...goal.toObject(), id: goal._id.toString() });
  } catch (error) {
    next(error);
  }
});

goalsRouter.patch("/:id", async (req, res, next) => {
  try {
    const allowed = ["saved", "name", "target", "deadline", "note", "completed", "color"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user.sub }, update, { returnDocument: 'after', runValidators: true });
    if (!goal) return res.status(404).json({ message: "Goal not found." });
    res.json({ ...goal.toObject(), id: goal._id.toString() });
  } catch (error) {
    next(error);
  }
});

goalsRouter.delete("/:id", async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.sub });
    if (!goal) return res.status(404).json({ message: "Goal not found." });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
