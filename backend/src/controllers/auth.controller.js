import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        message: "User created successfully",
        _id: newUser._id,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signin:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Attempting login with email:", email); // Debug: Check if email is received
  try {
    const user = await User.findOne({ email });
    console.log("User found:", !!user); // Debug: Check if user exists in DB
    if (!user) return res.status(400).json({ message: "Wrong Credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log("Password correct:", isPasswordCorrect); // Debug: Check password comparison result
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Wrong Credentials" });

    generateToken(user._id, res);
    return res.status(200).json({
      message: "Login successful",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfilePic = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: "Profile picture is required" });
    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    res
      .status(200)
      .json({
        message: "Profile picture updated successfully",
        profilePic: updatedUser.profilePic,
      });
  } catch (error) {
    console.log("Error in updateProfilePic:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.log("Error in checkAuth:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};