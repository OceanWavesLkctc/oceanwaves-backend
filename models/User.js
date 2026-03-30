//User.js

import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true
    },
    password:
    {
        type: String,
        required: true,
    },
    rollnumber:
    {
        type: Number,
        required: true,
        unique: true
    },
    course:
    {
        type: String,
        required: true,
    },
    department:
    {
        type: String,
        required: true
    },
    phonenumber:
    {
        type: Number,
        required: true,
        unique: true
    },
    role:
    {
        type: String,
        enum: ['student'],
        default: "student"
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

const userModel = mongoose.model("userModel", userSchema);
export default userModel;