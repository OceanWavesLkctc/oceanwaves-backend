
// Import dotenv to read environment variables

import connectDB from "./config/db.js";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

// Set the port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});