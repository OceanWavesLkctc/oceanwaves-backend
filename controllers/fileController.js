import mongoose from "mongoose";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import fileModel from "../models/fileUpload.js";
import crypto from "crypto";
import * as XLSX from "xlsx";

// Helper to normalize subject names
const normalizeSubject = (subjectInput) => {
    if (!subjectInput) return "Unknown Subject";
    const normalized = subjectInput.trim().toLowerCase();
    const subjectDict = {
        "dbms": "Database Management System",
        "database management system": "Database Management System",
        "database": "Database Management System",
        "os": "Operating Systems",
        "operating system": "Operating Systems",
        "cn": "Computer Networks",
        "computer network": "Computer Networks",
        "ds": "Data Structures",
        "data structure": "Data Structures",
        "algo": "Algorithms",
        "algorithms": "Algorithms",
        "daa": "Design and Analysis of Algorithms",
        "se": "Software Engineering",
        "software engineering": "Software Engineering"
    };
    return subjectDict[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

// Normalize req.body keys to lowercase
const normalizeBody = (body) => {
  const normalized = {};
  for (let key in body) {
    normalized[key.toLowerCase()] = body[key];
  }
  return normalized;
};




// ===== UPLOAD FILE =====
export const uploadFile = async (req, res) => {
    try {
        console.log("FILES:", req.files);
        console.log("req.body:", req.body);
        const uploadedFile = req.files && req.files.length > 0 ? req.files[0] : null;
        if (!uploadedFile) return res.status(400).json({ message: "No file uploaded" });

        const body = normalizeBody(req.body);
        const { course, subject, topic } = body;
        if (!course || !subject || !topic)
            return res.status(400).json({ message: "Course, Subject, and Topic are required" });

        const teacherId = req.user?.id;
        if (!teacherId) return res.status(401).json({ message: "Unauthorized" });

        // Prevent duplicate upload for same teacher + subject + topic + course
        const normalizedSubject = normalizeSubject(subject);
        const exists = await fileModel.findOne({
            uploadedBy: teacherId,
            subject: normalizedSubject,
            topic,
            course
        });
        if (exists) {
            return res.status(409).json({ message: "You have already uploaded questions for this course/subject/topic" });
        }

        // Parse Excel
        const workbook = XLSX.read(uploadedFile.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        // Case-insensitive column mapping
        const questions = rawData.map(row => {
            const questionKey = Object.keys(row).find(k => k.toLowerCase() === "question");
            const answerKey = Object.keys(row).find(k => k.toLowerCase() === "answer");
            return questionKey && answerKey ? {
                question: String(row[questionKey]).trim(),
                answer: String(row[answerKey]).trim()
            } : null;
        }).filter(q => q && q.question && q.answer);

        if (questions.length === 0)
            return res.status(400).json({ message: "Excel must contain Question and Answer columns with valid values" });

        const uploadId = "UL-" + crypto.randomBytes(4).toString('hex').toUpperCase();

        const fileRecord = await fileModel.create({
            course,
            subject: normalizedSubject,
            topic,
            uploadedBy: teacherId,
            questions,
            uploadId
        });

        
        return res.status(201).json({
            message: "Questions uploaded successfully",
            data: fileRecord
        });

    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ message: "Server error during upload" });
    }
};

// ===== UPDATE FILE =====
export const updateFile = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user?.id;

        if (!teacherId) return res.status(401).json({ message: "Unauthorized" });
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid file ID" });

        const file = await fileModel.findOne({ _id: id, uploadedBy: teacherId });
        if (!file) return res.status(404).json({ message: "File not found or unauthorized" });

        const body  = normalizeBody(req.body);
        const { course, subject, topic } = body;

        // Update metadata
        if (course) file.course = course;
        if (subject) file.subject = normalizeSubject(subject);
        if (topic) file.topic = topic;

        const uploadedFile = req.files?.[0];
        if (uploadedFile) {
            const workbook = XLSX.read(uploadedFile.buffer, { type: 'buffer' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawData = XLSX.utils.sheet_to_json(worksheet);

            const questions = rawData.map(row => {
                const questionKey = Object.keys(row).find(k => k.toLowerCase() === "question");
                const answerKey = Object.keys(row).find(k => k.toLowerCase() === "answer");
                return questionKey && answerKey ? {
                    question: String(row[questionKey]).trim(),
                    answer: String(row[answerKey]).trim()
                } : null;
            }).filter(q => q && q.question && q.answer);

            if (questions.length === 0)
                return res.status(400).json({ message: "Excel must contain Question and Answer columns" });

            file.questions = questions;
        }

        await file.save();

        return res.status(200).json({ message: "File updated successfully", data: file });

    } catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({ message: "Server error during update" });
    }
};

// ===== DELETE FILE =====
export const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user?.id;

        if (!teacherId) return res.status(401).json({ message: "Unauthorized" });
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid file ID" });

        const deleted = await fileModel.findOneAndDelete({ _id: id, uploadedBy: teacherId });
        if (!deleted) return res.status(404).json({ message: "File not found or unauthorized" });

        return res.status(200).json({ message: "Deleted successfully", id: deleted._id });

    } catch (error) {
        console.error("Delete error:", error);
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