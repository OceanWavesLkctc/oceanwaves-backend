//authRoutes.js
import dotenv from "dotenv"
import express from "express"
import { signup, login, logout, forgotPassword, resetPassword, googleLogin } from "../controllers/authController.js";
import { teacherSignup, teacherLogin, teacherDashboard, teacherLogout, teacherForgotPassword, teacherResetPassword, teacherGoogleLogin } from "../controllers/teacherController.js";
import { checkemail, tokenChecked } from "../middleware/authMiddleware.js";
import { uploadMiddleware, uploadFile } from "../controllers/fileController.js";

dotenv.config()

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/teachersignup", checkemail, teacherSignup);
router.post("/teacherLogin", teacherLogin);
router.post("/teacher/google-login", teacherGoogleLogin);
router.post("/teacherLogout", teacherLogout);
router.post("/teacher/forgot-password", teacherForgotPassword);
router.post("/teacher/reset-password", teacherResetPassword);

router.get("/teacherdashboard", tokenChecked, teacherDashboard);
router.post("/teacherUpload", uploadMiddleware, uploadFile);




export default router;