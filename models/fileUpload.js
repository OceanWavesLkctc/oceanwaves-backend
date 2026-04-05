import mongoose from "mongoose"


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
    fileName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    contentBase64: {
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
        required: true,
        default: "Unknown Teacher"
    }
}, { timestamps: true });

const fileModel = mongoose.model("fileModel", fileSchema);
export default fileModel;