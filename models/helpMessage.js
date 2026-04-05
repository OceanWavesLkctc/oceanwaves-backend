import mongoose from "mongoose";

const helpMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    userRole: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'open'
    }
}, { timestamps: true });

export default mongoose.model("helpMessage", helpMessageSchema);
