//authRoutes.js
import dotenv from "dotenv"
import express from "express"
import { signup } from "../controllers/authController.js";

dotenv.config()

const router = express.Router();

router.post("/signup", signup);

export default router;