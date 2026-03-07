// authController.js
import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const signup = async (req, res) => {
    console.log("Signup API hit");

    try {
        const { name, email, password, rollnumber, course, phonenumber, role } = req.body;

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
            rollnumber,
            phonenumber,
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
            { id: user._id, role: user.role },
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




