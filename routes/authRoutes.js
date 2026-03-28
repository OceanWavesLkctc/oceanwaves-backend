//authRoutes.js
import dotenv from "dotenv"
import express from "express"
import { signup, login, studentDashboard } from "../controllers/authController.js";
import { teacherSignup, teacherLogin, teacherDashboard } from "../controllers/teacherController.js";
import { checkemail, tokenChecked } from "../middleware/authMiddleware.js";
import { uploadMiddleware, uploadFile } from "../controllers/fileController.js";

dotenv.config()

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/teachersignup", checkemail, teacherSignup);
router.post("/teacherLogin", teacherLogin);
router.get("/teacherdashboard", tokenChecked, teacherDashboard);
router.post("/teacherUpload", uploadMiddleware, uploadFile);




export default router;