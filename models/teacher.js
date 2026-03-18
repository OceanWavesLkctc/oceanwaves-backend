//User.js

import mongoose from "mongoose"


const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true,
    },
    password:
    {
        type: String,
        required: true,
    },

    department:
    {
        type: String,
        required: true,
    },

    role:
    {
        type: String,
        enum: ['teacher'],
        default: "teacher"
    }
});

const teacherModel = mongoose.model("teacherModel", teacherSchema);
export default teacherModel;