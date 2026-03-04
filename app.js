// Import required packages
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Read JSON data


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});