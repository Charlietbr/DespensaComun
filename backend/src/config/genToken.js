import jwt from "jsonwebtoken";

export function genToken(userId) {
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn});
};