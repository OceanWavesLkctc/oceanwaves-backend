//authRoutes.js
import dotenv from "dotenv"
import express from "express"
import { signup, login, logout, forgotPassword, resetPassword/*, googleLogin*/, studentDashboard } from "../controllers/authController.js";
import { teacherSignup, teacherLogin, teacherDashboard, teacherLogout, teacherForgotPassword, teacherResetPassword/*, teacherGoogleLogin*/ } from "../controllers/teacherController.js";
import { checkemail, tokenChecked, isTeacher, isStudent } from "../middleware/authMiddleware.js";
import { uploadMiddleware, uploadFile, updateFile, deleteFile, viewFile } from "../controllers/fileController.js";
import { submitHelpMessage } from "../controllers/helpController.js";

dotenv.config()

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
// router.post("/google-login", googleLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/studentdashboard", tokenChecked, isStudent, studentDashboard);

router.post("/teachersignup", checkemail, teacherSignup);
router.post("/teacherLogin", teacherLogin);
// router.post("/teacher/google-login", teacherGoogleLogin);
router.post("/teacherLogout", teacherLogout);
router.post("/teacher/forgot-password", teacherForgotPassword);
router.post("/teacher/reset-password", teacherResetPassword);

router.get("/teacherdashboard", tokenChecked, isTeacher, teacherDashboard);
router.post("/teacherUpload", tokenChecked, isTeacher, uploadMiddleware, uploadFile);
router.put("/teacherFiles/:id", tokenChecked, isTeacher, uploadMiddleware, updateFile);
router.delete("/teacherFiles/:id", tokenChecked, isTeacher, deleteFile);
router.get("/teacherFiles/view/:id", viewFile);

// Help Center route for logged-in users and teachers
router.post("/helpcenter", tokenChecked, submitHelpMessage);

export default router;