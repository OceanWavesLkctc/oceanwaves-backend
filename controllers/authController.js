//authController.js
import userModel from "../models/User.js"
import bcrypt from "bcryptjs";

import dotenv from "dotenv";

dotenv.config();

const signup = async (req, res) => {
    try {
        const { name, email, password, course, branch } = req.body;
        const exist = await userModel.findone({ email });
        if (exist) res.status(400).json({ message: "user already exist" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const UserModel = new userModel({
            name,
            email,
            password: hashedPassword,
            course,
            branch
        });

        await UserModel.save();
    }
    catch (err) {
        res.status(500).json({ message: "error reported" });
    }
};
