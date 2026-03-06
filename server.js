
// Import dotenv to read environment variables

import connectDB from "./config/db.js";
import express from "express";
import dotenv from "dotenv";
import router from "./routes/authRoutes.js";


// Load .env file
dotenv.config();

const app = express();

app.use(express.json());

// Set the port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();


app.use("/lkctc/oceanwaves", router);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});