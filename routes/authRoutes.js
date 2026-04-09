//authRoutes.js
import dotenv from "dotenv"
import express from "express"
import { signup, login, logout, forgotPassword, resetPassword } from "../controllers/authController.js";
import { teacherSignup, teacherLogin, teacherLogout, teacherForgotPassword, teacherResetPassword } from "../controllers/teacherController.js";
import { checkemail, tokenChecked, isStudent, isTeacher } from "../middleware/authMiddleware.js";
import { uploadFile, updateFile, deleteFile } from "../controllers/fileController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { submitHelpMessage } from "../controllers/helpController.js";

dotenv.config()

const router = express.Router();

// Student Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// router.get("/studentdashboard", tokenChecked, isStudent, studentDashboard);

// Teacher Routes
router.post("/teachersignup", checkemail, teacherSignup);
router.post("/teacherLogin", teacherLogin);
router.post("/teacherLogout", teacherLogout);
router.post("/teacher/forgot-password", teacherForgotPassword);
router.post("/teacher/reset-password", teacherResetPassword);
// router.get("/teacherdashboard", tokenChecked, isTeacher, teacherDashboard);

// File Management (Teacher only)
router.post("/teacherUpload", tokenChecked, isTeacher, uploadMiddleware, uploadFile);
router.put("/file/update/:id", tokenChecked, isTeacher, uploadMiddleware, updateFile);
router.delete("/file/delete/:id", tokenChecked, isTeacher, deleteFile);

// Shared / Support
router.get("/file/view/:id", tokenChecked); // Anyone logged in can view? Or restrict to role?
router.post("/help/submit", tokenChecked, submitHelpMessage);

export default router;