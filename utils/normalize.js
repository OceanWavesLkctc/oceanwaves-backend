export const SUPPORTED_COURSES = ["B.Tech", "BCA", "MCA"];

const COURSE_LOOKUP = {
    "btech": "B.Tech",
    "bca": "BCA",
    "mca": "MCA"
};

export const normalizeCourse = (course) => {
    if (!course || typeof course !== "string") {
        return null;
    }

    const sanitized = course.trim().toLowerCase().replace(/[\s._-]+/g, "");
    return COURSE_LOOKUP[sanitized] || null;
};

export const isValidCourse = (course) => {
    return typeof course === "string" && SUPPORTED_COURSES.includes(course);
};