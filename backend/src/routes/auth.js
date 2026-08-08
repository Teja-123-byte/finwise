import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

function tokenFor(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Name, email, and a password of at least 8 characters are required." });
    }
    const exists = await User.exists({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "An account with this email already exists." });

    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    return res.status(201).json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(req.body.password ?? "", user.passwordHash))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    return res.json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    next(error);
  }
});
