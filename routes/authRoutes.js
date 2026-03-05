//authRoutes.js
import UserModel from "../controllers/authController.js"
import dotenv from "dotenv"
import express from "express"

dotenv.config()

const router = express.Router();

router.post("/signup", signup);