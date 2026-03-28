import mongoose from "mongoose"


const fileSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    public_id:
    {
        type: String,
        required: true,
    },

    resource_type:
    {
        type: String,
        required: true,
    },

    format:
    {
        type: String,
        required: true
    }
});

const fileModel = mongoose.model("fileModel", fileSchema);
export default fileModel;