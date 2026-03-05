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
    course:
    {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        required: true
    },
    role:
    {
        type: String,
        enum: ["student", "teacher"]
    }
});

const userModel = mongoose.model("userModel", userSchema);