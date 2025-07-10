import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ message: "You're not Authenticated." });
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userName = decode.userName;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(403).json({ message: "Invalid Token." });
    }
}