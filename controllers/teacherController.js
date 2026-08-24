import teacherModel from "../models/teacher.js";
import fileModel from "../models/fileUpload.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const teacherSignup = async (req, res) => {
    try {
        const { name, email, password, department, role } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Teacher name is required" });
        }

        const teacherexist = await teacherModel.findOne({ email });
        if (teacherexist) {
            return res.status(400).json({ message: "Teacher already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newTeacher = new teacherModel({
            name,
            email,
            password: hashedPassword,
            department,
            role
        });

        await newTeacher.save();

        // IMPORTANT RESPONSE
        res.status(201).json({
            message: "User registered successfully",
            user: newTeacher
        });

    } catch (err) {
        console.log("Signup Error:", err);
        res.status(500).json({ message: "Error occurred" });
    }
};

export const teacherLogin = async (req, res) => {
    console.log("login api hit");

    try {
        const { email, password } = req.body;

        const teacher = await teacherModel.findOne({ email });
        if (!teacher) {
            return res.status(400).json({
                message: "teacher not found"
            });
        }

        const isMatch = await bcrypt.compare(password, teacher.password);

        if (!isMatch) {
            return res.status(402).json
                ({
                    message: "invalid password"
                });
        }

        const token = jwt.sign(
            {
                id: teacher._id,
                email: teacher.email,
                name: teacher.name,
                role: teacher.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.status(200).json({
            message: "login successfully",
            token: token,
            user: teacher
        });

    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).json({
            message: "Login failed"
        });

    };
};


export const teacherDashboard = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // Fetch files uploaded by this teacher, sorted by newest first
        const files = await fileModel.find({ uploadedBy: teacherId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Welcome to dashboard",
            files: files
        });
    } catch (error) {
        console.log("Dashboard fetch error:", error);
        return res.status(500).json({ message: "Error fetching dashboard data" });
    }
};

export const teacherLogout = async (req, res) => {
    console.log("logout api hit");
    try {
        res.status(200).json({
            message: "logout successfully",
            token: ""
        });
    } catch (error) {
        console.log("Logout Error:", error);
        res.status(500).json({
            message: "Logout failed"
        });
    }
};

export const teacherForgotPassword = async (req, res) => {
    try {
        if (!req.body || !req.body.email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const { email } = req.body;
        const teacher = await teacherModel.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        teacher.resetPasswordToken = resetToken;
        teacher.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
        await teacher.save();

        res.status(200).json({
            message: "Password reset token generated",
            resetToken
        });
    } catch (error) {
        console.log("Teacher Forgot Password Error:", error);
        res.status(500).json({ message: "Error generating reset token" });
    }
};

export const teacherResetPassword = async (req, res) => {
    try {
        if (!req.body || !req.body.token || req.body.newPassword === undefined) {
            return res.status(400).json({ message: "Token and newPassword are required" });
        }
        const { token, newPassword } = req.body;

        const teacher = await teacherModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!teacher) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(String(newPassword), 10);
        teacher.password = hashedPassword;
        teacher.resetPasswordToken = undefined;
        teacher.resetPasswordExpires = undefined;
        await teacher.save();

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.log("Teacher Reset Password Error:", error);
        res.status(500).json({ message: "Error resetting password" });
    }
};