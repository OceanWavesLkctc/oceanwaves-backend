import multer from "multer";

const storage = multer.memoryStorage();

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
}).any(); // accepts files from any field name

export default uploadMiddleware;