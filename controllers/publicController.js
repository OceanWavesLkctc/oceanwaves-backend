import fileModel from "../models/fileUpload.js";
import { normalizeCourse, SUPPORTED_COURSES } from "../utils/normalize.js";

export const getPublicQuestions = async (req, res) => {
  try {
    console.log("Request received:", req.query);
    const { course, subject, topic, page = 1, limit = 10 } = req.query;

    const FREE_LIMIT = 3;
    const query = {};
    if (course) {
      const normalizedCourse = normalizeCourse(course);
      if (!normalizedCourse) {
        return res.status(400).json({
          message: `Invalid course: '${course}'. Supported courses are: ${SUPPORTED_COURSES.join(", ")}`
        });
      }
      query.course = normalizedCourse;
    }
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;

    const files = await fileModel.find(query).lean();

    let questions = files.flatMap(file =>
      file.questions.map((q, index) => ({
        question: q.question,
        answer: index < FREE_LIMIT ? q.answer : " Unlock to view answer",
        locked: index >= FREE_LIMIT,
        subject: file.subject,
        topic: file.topic
      }))
    );

    // Pagination
    const start = (page - 1) * limit;
    const paginated = questions.slice(start, start + Number(limit));

    res.json({
      total: questions.length,
      page: Number(page),
      data: paginated
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};