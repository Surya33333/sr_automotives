
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.sr_session;

    console.log("Session cookie present:", Boolean(token));

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    console.log("JWT verified successfully");
    console.log("Customer ID:", decoded.customer_id);

    req.customer = decoded;

    next();
  } catch (error) {
    console.error("JWT verification failed:", error.name, error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
};

export default authMiddleware;
