import { Router } from "express";
import { Transaction } from "../models/transaction.js";
import { requireAuth } from "../middleware/auth.js";
import { classifyTransaction } from "../services/classifier.js";

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

transactionsRouter.get("/", async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.sub }).sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) { next(error); }
});

transactionsRouter.post("/classify", (req, res) => {
  if (!req.body.note || !req.body.kind) return res.status(400).json({ message: "note and kind are required." });
  return res.json(classifyTransaction(req.body.note, req.body.kind));
});

transactionsRouter.post("/", async (req, res, next) => {
  try {
    const { note, amount, kind, date, category, autoClassify } = req.body;
    const prediction = classifyTransaction(note ?? "", kind);
    const useClassifier = autoClassify === true || !category;
    const transaction = await Transaction.create({
      user: req.user.sub, note, amount, kind, date,
      category: useClassifier ? prediction.category : category,
      classification: { source: useClassifier ? "ml-lite" : "manual", confidence: useClassifier ? prediction.confidence : 1 },
    });
    return res.status(201).json(transaction);
  } catch (error) { next(error); }
});

transactionsRouter.patch("/:id", async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate({ _id: req.params.id, user: req.user.sub }, req.body, { returnDocument: 'after', runValidators: true });
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });
    return res.json(transaction);
  } catch (error) { next(error); }
});

transactionsRouter.delete("/:id", async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.sub });
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });
    return res.status(204).send();
  } catch (error) { next(error); }
});
