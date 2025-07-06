import express from "express";
import authRoutes from "./routes/auth";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Auth routes mounted here
app.use("/auth", authRoutes);

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
