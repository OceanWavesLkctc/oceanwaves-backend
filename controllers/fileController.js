import mongoose from "mongoose";
import fileModel from "../models/fileUpload.js";
import teacherModel from "../models/teacher.js";
import multer from "multer";
import * as XLSX from "xlsx";
import crypto from "crypto";

const storage = multer.memoryStorage();


const upload = multer({
    storage,
    limits: { fileSize: 30 * 1024 * 1024 }
});


export const uploadMiddleware = upload.any();


const normalizeSubject = (subjectInput) => {
    if (!subjectInput) return "Unknown Subject";

    const normalized = subjectInput.trim().toLowerCase();

    const subjectDictionary = {
        "dbms": "Database Management System",
        "database management system": "Database Management System",
        "database": "Database Management System",
        "os": "Operating Systems",
        "operating system": "Operating Systems",
        "operating systems": "Operating Systems",
        "cn": "Computer Networks",
        "computer network": "Computer Networks",
        "computer networks": "Computer Networks",
        "ds": "Data Structures",
        "data structure": "Data Structures",
        "data structures": "Data Structures",
        "algo": "Algorithms",
        "algorithms": "Algorithms",
        "daa": "Design and Analysis of Algorithms",
        "se": "Software Engineering",
        "software engineering": "Software Engineering"
    };

    // If the subject is in our dictionary, return the standard name, otherwise capitalize the input and use it
    if (subjectDictionary[normalized]) {
        return subjectDictionary[normalized];
    }

    // Capitalize first letter of unknown subjects as a fallback
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const uploadFile = async (req, res) => {
    try {
        let uploadedFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

        if (!uploadedFile) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { course, subject, topic } = req.body;

        if (!course || !subject || !topic) {
            return res.status(400).json({ message: "Course, Subject, and Topic fields are required" });
        }

        // Generate a unique Upload ID (e.g., UL-A7B2C)
        const uploadId = "UL-" + crypto.randomBytes(3).toString('hex').toUpperCase();

        // Convert file buffer to Base64 String
        const base64String = uploadedFile.buffer.toString('base64');

        let structuredData = [];
        // Check if it is an Excel file
        const excelMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (excelMimeTypes.includes(uploadedFile.mimetype)) {
            try {
                const workbook = XLSX.read(uploadedFile.buffer, { type: 'buffer' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                // Convert to JSON
                structuredData = XLSX.utils.sheet_to_json(worksheet);
            } catch (excelError) {
                console.error("Excel parsing error:", excelError);
                // We'll continue but structuredData will be empty or we could return error
            }
        }

        // Normalize the subject name to handle inconsistency
        const standardSubject = normalizeSubject(subject);

        // Assume tokenChecked middleware has set req.user
        const teacherId = req.user ? req.user.id : null;

        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized. Teacher ID not found." });
        }

        // Use teacher's name from token, fallback to DB if missing
        let actualTeacherName = req.user && req.user.name ? req.user.name : null;

        if (!actualTeacherName) {
            const teacher = await teacherModel.findById(teacherId);
            actualTeacherName = teacher && teacher.name ? teacher.name : "Unknown Teacher";
        }

        // Save to Database
        const fileRecord = await fileModel.create({
            course: course,
            subject: standardSubject,
            topic: topic,
            fileName: uploadedFile.originalname,
            mimeType: uploadedFile.mimetype,
            contentBase64: base64String,
            structuredContent: structuredData,
            uploadId: uploadId,
            uploadedBy: teacherId,
            teacherName: actualTeacherName
        });

        // We return the info (exclude the massive base64 string from the success response to save bandwidth)
        return res.status(200).json({
            message: "File converted to text and stored in database successfully",
            resource: {
                id: fileRecord._id,
                course: fileRecord.course,
                subject: fileRecord.subject,
                topic: fileRecord.topic,
                fileName: fileRecord.fileName,
                mimeType: fileRecord.mimeType,
                uploadId: fileRecord.uploadId
            }
        });

    }
    catch (error) {
        console.log("Upload error: ", error);

        // Handle multer's limit error specifically
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "File is too large. Maximum size is 10MB to fit in the database." });
        }

        return res.status(500).json({
            message: "Server error during upload",
            error: error.message
        });
    }
};

export const updateFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const teacherId = req.user ? req.user.id : null;

        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized. Teacher ID not found." });
        }

        const { course, subject, topic } = req.body;

        const file = await fileModel.findOne({ _id: fileId, uploadedBy: teacherId });
        if (!file) {
            return res.status(404).json({ message: "File not found or unauthorized" });
        }

        if (course) file.course = course;
        if (subject) {
            file.subject = normalizeSubject(subject);
        }
        if (topic) {
            file.topic = topic;
        }

        let uploadedFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

        if (uploadedFile) {
            file.fileName = uploadedFile.originalname;
            file.mimeType = uploadedFile.mimetype;
            file.contentBase64 = uploadedFile.buffer.toString('base64');

            // Parse if Excel
            const excelMimeTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            if (excelMimeTypes.includes(uploadedFile.mimetype)) {
                try {
                    const workbook = XLSX.read(uploadedFile.buffer, { type: 'buffer' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    file.structuredContent = XLSX.utils.sheet_to_json(worksheet);
                } catch (excelError) {
                    console.error("Excel update parsing error:", excelError);
                }
            }
        }

        await file.save();

        return res.status(200).json({
            message: "File updated successfully",
            resource: {
                id: file._id,
                course: file.course,
                subject: file.subject,
                topic: file.topic,
                fileName: file.fileName,
                mimeType: file.mimeType
            }
        });
    } catch (error) {
        console.log("Update file error:", error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "File is too large. Maximum size is 10MB." });
        }
        return res.status(500).json({ message: "Server error during update" });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const teacherId = req.user ? req.user.id : null;

        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized. Teacher ID not found." });
        }

        const file = await fileModel.findOneAndDelete({ _id: fileId, uploadedBy: teacherId });
        if (!file) {
            return res.status(404).json({ message: "File not found or unauthorized to delete" });
        }

        return res.status(200).json({ message: "File deleted successfully", fileId });
    } catch (error) {
        console.log("Delete file error:", error);
        return res.status(500).json({ message: "Server error during deletion" });
    }
};

// ===== VIEW SINGLE FILE =====
export const viewFile = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid file ID" });
        }

        const file = await fileModel.findById(id).populate("uploadedBy", "name email department");
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        return res.status(200).json({
            message: "File retrieved successfully",
            data: file
        });
    } catch (error) {
        console.error("View file error:", error);
        return res.status(500).json({ message: "Server error during file retrieval" });
    }
};