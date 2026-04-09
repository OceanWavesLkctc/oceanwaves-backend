
import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import fileModel from "../models/fileUpload.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";
dotenv.config({ path: './oceanwaves.env' });

export const signup = async (req, res) => {
    console.log("Signup API hit");

    try {
        const { name, email, password, rollnumber, course, department, role } = req.body;

        const exist = await userModel.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const rollExist = await userModel.findOne({ rollnumber });
        if (rollExist) {
            return res.status(400).json({
                message: "Roll number already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            course,
            department,
            rollnumber,
            role
        });

        await newUser.save();

        // IMPORTANT RESPONSE
        res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });

    } catch (err) {
        console.log("Signup Error:", err);
        res.status(500).json({ message: "Error occurred" });
    }
};



export const login = async (req, res) => {
    console.log("login api hit");

    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status("400").json({
                message: "user not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(402).json
                ({
                    message: "invalid password"
                });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }

        );

        res.status(200).json({
            message: "login successfully",
            token: token,
            user: user
        });

    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).json({
            message: "Login failed"
        });

    };
}

export const logout = async (req, res) => {
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

export const forgotPassword = async (req, res) => {
    try {
        if (!req.body || !req.body.email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        res.status(200).json({
            message: "Password reset token generated",
            resetToken
        });
    } catch (error) {
        console.log("Forgot Password Error:", error);
        res.status(500).json({ message: "Error generating reset token" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        if (!req.body || !req.body.token || req.body.newPassword === undefined) {
            return res.status(400).json({ message: "Token and newPassword are required" });
        }
        const { token, newPassword } = req.body;

        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(String(newPassword), 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.log("Reset Password Error:", error);
        res.status(500).json({ message: "Error resetting password" });
    }
};

// export const studentDashboard = async (req, res) => {
//     try {
//         const studentId = req.user.id;
//         const student = await userModel.findById(studentId);
        
//         if (!student) {
//             return res.status(404).json({ message: "Student not found" });
//         }

//         const studentCourse = student.course;

//         // Fetch files perfectly matched to the student's enrolled course
//         const files = await fileModel.find({ course: studentCourse })
//             .select('-contentBase64') // Keep the dashboard lightweight
//             .sort({ createdAt: -1 });

//         return res.status(200).json({
//             message: "Student dashboard loaded successfully",
//             course: studentCourse,
//             files: files
//         });
//     } catch (error) {
//         console.log("Student dashboard error:", error);
//         return res.status(500).json({ message: "Server error fetching student dashboard" });
//     }
// };
