// import bcrypt from "bcryptjs";
// import User from "../models/User.js"
// import { generateToken } from "../../lib/utils.js";
// import cloudinary from "../../lib/cloudinary.js";

// export const signUp = async (req, res) => {
//     try {
//         let { email, fullName, password, bio } = req.body;

//         if (!email || !fullName || !password) {
//             return res.status(400).json({ success: false, message: "Invalid data" });
//         }

//         email = email.toLowerCase().trim();

//         const exists = await User.findOne({ email });
//         if (exists) {
//             return res.status(400).json({ success: false, message: "User already exists" });
//         }

//         const hashed = await bcrypt.hash(password, 10);
//         const user = await User.create({ email, fullName, password: hashed, bio });

//         const token = generateToken(user._id);

//         res.json({
//             success: true,
//             token,
//             user: {
//                 _id: user._id,
//                 email: user.email,
//                 fullName: user.fullName,
//                 bio: user.bio,
//                 profilePic: user.profilePic,
//             },
//             message: "Welcome"
//         });
//         // } catch {
//         //     res.status(500).json({ success: false, message: "Server error" });
//         // }

//     } catch (error) {
//         next(error); // ← Pass to global handler
//     }
// };





// export const login = async (req, res) => {
//     try {
//         let { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ success: false, message: "Invalid credentials" });
//         }

//         email = email.toLowerCase().trim();

//         const user = await User.findOne({ email }).select("+password");
//         if (!user) {
//             return res.status(400).json({ success: false, message: "Invalid credentials" });
//         }

//         const match = await bcrypt.compare(password, user.password);
//         if (!match) {
//             return res.status(400).json({ success: false, message: "Invalid credentials" });
//         }

//         const token = generateToken(user._id);

//         res.json({
//             success: true,
//             token,
//             user: {
//                 _id: user._id,
//                 email: user.email,
//                 fullName: user.fullName,
//                 bio: user.bio,
//                 profilePic: user.profilePic,
//             },
//             message: "Logged in successfully"
//         });
//         // } catch {
//         //     res.status(500).json({ success: false, message: "Server error" });
//         // }

//     } catch (error) {
//         next(error); // ← Pass to global handler
//     }
// };



// export const checkAuth = async (req, res) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader?.startsWith("Bearer ")) {
//             return res.json({ success: false });
//         }

//         const token = authHeader.split(" ")[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         const user = await User.findById(decoded.id).select("-password");

//         if (!user) {
//             return res.json({ success: false });
//         }

//         res.json({ success: true, user });
//     } catch {
//         res.json({ success: false });
//     }
// };



// export const updateProfile = async (req, res) => {
//     try {
//         const { fullName, bio, profilePic } = req.body;

//         const userId = req.user._id;
//         let updateUser;
//         if (!profilePic) {
//             updateUser = await User.findByIdAndUpdate(
//                 userId,
//                 { fullName, bio },
//                 { new: true }
//             );
//         } else {
//             const upload = await cloudinary.uploader.upload(profilePic);
//             updateUser = await User.findByIdAndUpdate(
//                 userId,
//                 { fullName, bio, profilePic: upload.secure_url },
//                 { new: true }
//             );
//         }
//         res.json({ success: true, user: updateUser, message: "Profile updated successfully" });
//         // } catch (error) {
//         //     console.error("Error updating profile:", error.message);
//         //     res.status(500).json({ success: false, message: "Server Error" });
//         // }

//     } catch (error) {
//         next(error); // ← Pass to global handler
//     }
// };


























// After adding error handler



import bcrypt from "bcryptjs";
import createError from "http-errors";
import User from "../models/User.js";
import { generateToken } from "../../lib/utils.js";
import cloudinary from "../../lib/cloudinary.js";

import crypto from "crypto";
import nodemailer from "nodemailer";

export const signUp = async (req, res, next) => {
    try {
        const { email, fullName, password, bio } = req.body;

        if (!email || !fullName || !password) {
            throw createError.BadRequest("Email, full name, and password are required");
        }

        const normalizedEmail = email.toLowerCase().trim();

        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) {
            throw createError.Conflict("User already exists with this email");
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            email: normalizedEmail,
            fullName,
            password: hashed,
            bio,
        });

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                bio: user.bio,
                profilePic: user.profilePic,
            },
            message: "Welcome!",
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw createError.BadRequest("Email and password are required");
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw createError.Unauthorized("Invalid credentials");
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                bio: user.bio,
                profilePic: user.profilePic,
            },
            message: "Logged in successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const checkAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.json({ success: false });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.json({ success: false });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                bio: user.bio,
                profilePic: user.profilePic,
            },
        });
    } catch (error) {
        // Invalid or expired token
        res.json({ success: false });
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { fullName, bio, profilePic } = req.body;

        const userId = req.user._id;

        if (fullName && (fullName.length < 2 || fullName.length > 30)) {
            throw createError.BadRequest("Full name must be between 2 and 30 characters");
        }

        if (bio && (bio.length < 3 || bio.length > 25)) {
            throw createError.BadRequest("Bio must be between 3 and 25 characters");
        }

        let updateUser;
        if (!profilePic) {
            updateUser = await User.findByIdAndUpdate(
                userId,
                { fullName, bio },
                { new: true, runValidators: true }
            );
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updateUser = await User.findByIdAndUpdate(
                userId,
                { fullName, bio, profilePic: upload.secure_url },
                { new: true, runValidators: true }
            );
        }
        res.json({ success: true, user: updateUser, message: "Profile updated successfully" });

    } catch (error) {
        next(error); // ← Pass to global handler
    }
};











// Forgot Password
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) throw createError.BadRequest("Email is required");

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            // Don't reveal if email exists
            return res.json({ success: true, message: "If email exists, reset link sent" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetTokenExpiry;
        await user.save();

        // Send email
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`.trim();

        const transporter = nodemailer.createTransport({
            service: "gmail", // or your provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            to: user.email,
            subject: "Password Reset - Chatlify",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Reset Password
                </a>
            </div>
            <p>If you didn't request this, ignore this email.</p>
            <p><small>Link: ${resetUrl}</small></p>
        </div>
    `,
        });

        res.json({ success: true, message: "If email exists, reset link sent" });
    } catch (error) {
        next(error);
    }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            throw createError.BadRequest("Password must be at least 6 characters");
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) {
            throw createError.BadRequest("Invalid or expired token");
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        next(error);
    }
};