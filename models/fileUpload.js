import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

const fileSchema = new mongoose.Schema({
    course: {
        type: String,
        required: true,
        default: "General"
    },
    subject: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacherModel',
        required: true
    },

    teacherName: {
        type: String,
        default: "Unknown Teacher"
    },

    questions: [questionSchema], // ✅ structured data

    uploadId: {
        type: String,
        unique: true,
        required: true
    }

}, { timestamps: true });

const fileModel = mongoose.model("fileModel", fileSchema);
export default fileModel;