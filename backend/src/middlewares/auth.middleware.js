import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token)
      return res.status(401).json({ message: "Not authorized, no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (!decoded)
      return res.status(401).json({ message: "Not authorized, token failed" });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ message: "Not authorized, user not found" });

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute:", error.message);
    return res.status(500).json({ message: "Not authorized, token failed" });
  }
};
