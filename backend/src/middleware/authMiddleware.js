import jwt from "jsonwebtoken";
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // Check if Authorization header exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required"
            });
        }
        // Expected format: Bearer <token>
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }
        const token = parts[1];
        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        // Store decoded information in request
        req.customer = decoded;
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
export default authMiddleware;