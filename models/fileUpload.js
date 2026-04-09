import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    course: {
        type: String,
        required: true,
        default: "General"
    },
    subject: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacherModel',
        required: true
    },
    uploadId: {
        type: String,
        unique: true,
        required: true
    },
    questions: {
        type: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true }
            }
        ],
        default: []
    }
}, { timestamps: true });

// Unique index to prevent duplicate uploads per teacher/course/subject/topic
fileSchema.index({ uploadedBy: 1, course: 1, subject: 1, topic: 1 }, { unique: true });

const fileModel = mongoose.model("fileModel", fileSchema);
export default fileModel;