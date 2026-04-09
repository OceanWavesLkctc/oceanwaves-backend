import express from "express";
import { getPublicQuestions } from "../controllers/publicController.js";

const publicRouter = express.Router();

publicRouter.get("/questions", getPublicQuestions);

export default publicRouter;