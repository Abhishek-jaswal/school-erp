import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  const { id, password } = req.body;

  if (id === "admin" && password === "admin123") {
    const token = jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });
    return res.json({ message: "✅ Admin logged in", token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

export default router; // ✅ MUST BE ROUTER
