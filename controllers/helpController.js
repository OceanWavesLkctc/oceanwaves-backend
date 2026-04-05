import helpMessageModel from "../models/helpMessage.js";

export const submitHelpMessage = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const userRole = req.user ? req.user.role : 'user';

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { message } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({ message: "Message content cannot be blank." });
        }

        const newHelpMessage = new helpMessageModel({
            userId,
            userRole,
            message
        });

        await newHelpMessage.save();

        return res.status(201).json({
            message: "Help message submitted successfully! Support will get back to you soon.",
            helpMessage: newHelpMessage
        });
    } catch (error) {
        console.log("Help Message Error:", error);
        return res.status(500).json({ message: "Server error while submitting help message" });
    }
};
