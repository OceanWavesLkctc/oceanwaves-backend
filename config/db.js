import mongoose from "mongoose";

mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DataBase Connected Successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        console.log("Attempting connection to local MongoDB...");
        try {
            await mongoose.connect("mongodb://127.0.0.1:27017/oceanwaves");
            console.log("Connected to local MongoDB successfully");
        } catch (localErr) {
            console.error("Local MongoDB also failed. Server will run with database offline.");
        }
    }
};

export default connectDB;