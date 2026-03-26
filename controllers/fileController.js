import fileModel from "../models/fileUpload.js";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import multer from "multer";


dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 30 * 1024 * 1024 }
});

export const uploadMiddleware = upload.single("file");

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.v2.uploader.upload_stream({ resource_type: "auto", }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });

            stream.end(req.file.buffer);
        });

        if (fileModel) {

            const fileFormat = req.file.originalname.split(".").pop();
            const fileM = await fileModel.create({
                url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type,
                format: result.format || fileFormat || "unknown",
            });
        }

        return res.status(200).json({ message: "File Upload", data: result });
    }
    catch (error) {
        console.error("Full error", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};