import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";


// signUp

export const signUp = async (req, res) => {

    const { email, fullName, password, bio } = req.body;

    try {

        if (!email || !fullName || !password || !bio) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ email, fullName, password: hashedPassword, bio });

        const token = generateToken(newUser._id);

        res.json({ success: true, token, user: newUser, message: "User created successfully" });

    } catch (error) {
        console.error("Error during sign up:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};



// login

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        const token = generateToken(user._id);

        res.json({ success: true, token, user, message: "Login successful" });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};





// Controller to get authenticated user details
export const checkAuth = async (req, res) => {
    res.send({ success: true, user: req.user });
};


// controller to update User user Profile details
export const updateProfile = async (req, res) => {
    try {
        const { fullName, bio, profilePic } = req.body;

        const userId = req.user._id;
        let updateUser;
        if (!profilePic) {
            updateUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true });
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updateUser = await User.findByIdAndUpdate(userId, { fullName, bio, profilePic: upload.secure_url }, { new: true });
        }
        res.json({ success: true, user: updateUser, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
