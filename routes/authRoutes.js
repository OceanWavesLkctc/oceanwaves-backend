//authRoutes.js
import dotenv from "dotenv"
import express from "express"
import { signup, login } from "../controllers/authController.js";
import { teacherSignup, teacherLogin } from "../controllers/teacherController.js";

dotenv.config()

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/teachersignup", teacherSignup);
router.post("/teacherLogin", teacherLogin);

export default router;