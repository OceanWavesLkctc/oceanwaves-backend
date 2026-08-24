import connectDB from "./config/db.js";
import express from "express";
import dotenv from "dotenv";
import router from "./routes/authRoutes.js";
import publicRouter from "./routes/publicRoutes.js";


dotenv.config({ path: './oceanwaves.env' });

const app = express();

app.use(express.json());


const PORT = process.env.PORT || 3000;


connectDB();


app.use("/lkctc/oceanwaves", router);
app.use("/lkctc/oceanwaves/public", publicRouter);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});