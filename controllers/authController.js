//authController.js
import userModel from "../models/User.js";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";

dotenv.config();

export const signup = async (req, res) => {
    console.log("Signup API hit");

    try {
        const { name, email, password, rollnumber, course, phonenumber, role } = req.body;
        const exist = await userModel.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "user already exist" });
        }
        const rollExist = await userModel.findOne({ rollnumber });

        if (rollExist) {
            return res.status(400).json({
                message: "Roll number already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const UserModel = new userModel({
            name,
            email,
            password: hashedPassword,
            course,
            rollnumber,
            phonenumber,
            role
        });

        await UserModel.save();
    }
    catch (err) {
        console.log("Signup Error:", err);
        res.status(500).json({ message: "error reported" });
    }
};
