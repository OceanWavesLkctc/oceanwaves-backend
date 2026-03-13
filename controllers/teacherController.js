import teacherModel from "../models/teacher.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";


export const teacherSignup = async (req, res) => {
    try {
        const { name, email, password, department, role } = req.body;

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
            return res.status("400").json({
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
            { id: teacher._id, role: teacher.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }

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