import jwt from "jsonwebtoken"
function authenticateBearerToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: "Bearer Token is required." })
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid Token" }); // Forbidden
        }
        req.user = user;
        next(); // Pass the execution to the next middleware/route handler
    });
}

export default authenticateBearerToken
