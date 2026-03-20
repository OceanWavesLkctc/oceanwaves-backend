import dotenv from "dotenv";
import jwt from "jsonwebtoken";


export const checkemail = async (req, res, next) => {
    const { email } = req.body;

    const domain = email.split('@')[1];
    const allowedDomain = ["kclimt.com", "lkcengg.edu.in"];

    if (!allowedDomain.includes(domain)) {
        return res.status(400).json({ message: "please provide right email" });
    }
    next();
};


export const tokenChecked = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "no token provided" });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("Decoded data: ", decoded);

        next();
    }

    catch (err) {
        console.log(err);
        return res.status(401).json({ message: "no token provided" });
    }
}