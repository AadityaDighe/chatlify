import createError from "http-errors";
import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import mongoose from "mongoose";
import { decryptMessage, encryptMessage } from "../../lib/encryption.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const validateBase64Image = (base64) => {
    const matches = base64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!matches) throw createError.BadRequest("Invalid image format");

    const mimeType = matches[1];
    const base64Data = matches[2];

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(mimeType)) {
        throw createError.UnsupportedMediaType("Only JPG, PNG, WEBP, GIF allowed");
    }

    const size = (base64Data.length * 3) / 4;
    if (size > MAX_IMAGE_SIZE) {
        throw createError.PayloadTooLarge("Image too large (max 5MB)");
    }

    return mimeType;
};

export const getUsersForSidebar = async (req, res, next) => {
    try {
        const myId = req.user._id;

        const users = await User.find({ _id: { $ne: myId } })
            .select("fullName profilePic bio")
            .lean();

        const unseenCounts = await Message.aggregate([
            { $match: { receiverId: myId, seen: false } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } },
        ]);

        const unseenMap = {};
        unseenCounts.forEach((u) => (unseenMap[u._id] = u.count));

        res.json({ success: true, users, unseenMessages: unseenMap });
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const otherUserId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            throw createError.BadRequest("Invalid user ID");
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: myId },
            ],
            isDeleted: false,
        })
            .sort({ createdAt: 1 })
            .populate("replyTo", "text image senderId createdAt")
            .lean();

        await Message.updateMany(
            { senderId: otherUserId, receiverId: myId, seen: false },
            { $set: { seen: true } }
        );

        // ✅ Decrypt all messages before sending
        const decryptedMessages = messages.map((msg) => ({
            ...msg,
            text: msg.text ? decryptMessage(msg.text) : "",
            replyTo: msg.replyTo ? {
                ...msg.replyTo,
                text: msg.replyTo.text ? decryptMessage(msg.replyTo.text) : "",
            } : null,
        }));

        res.json({ success: true, messages: decryptedMessages });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user._id.toString();
        const receiverId = req.params.id;
        const { text, image, replyTo } = req.body;

        const trimmedText = text?.trim();

        if (!trimmedText && !image) {
            throw createError.BadRequest("Message cannot be empty");
        }

        if (senderId === receiverId) {
            throw createError.BadRequest("Cannot message yourself");
        }

        const senderSocketId = userSocketMap[senderId];
        const receiverSocketId = userSocketMap[receiverId];

        let imageUrl = "";

        if (image) {
            validateBase64Image(image);

            if (senderSocketId) {
                io.to(senderSocketId).emit("upload:started");
            }

            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chat_images",
                resource_type: "image",
            });

            imageUrl = uploadResponse.secure_url;

            if (senderSocketId) {
                io.to(senderSocketId).emit("upload:completed");
            }
        }

        const encryptedText = trimmedText ? encryptMessage(trimmedText) : "";

        const message = await Message.create({
            senderId,
            receiverId,
            text: encryptedText || "",
            image: imageUrl || undefined,
            replyTo: replyTo || null,
        });

        await message.populate("replyTo", "text image senderId createdAt");

        const decryptedMessage = {
            ...message.toObject(),
            text: message.text ? decryptMessage(message.text) : "",
            replyTo: message.replyTo ? {
                ...message.replyTo.toObject(),
                text: message.replyTo.text ? decryptMessage(message.replyTo.text) : "",
            } : null,
        };

        if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", decryptedMessage);
        if (senderSocketId) io.to(senderSocketId).emit("newMessage", decryptedMessage);

        res.json({ success: true, newMessage: decryptedMessage });
    } catch (error) {
        next(error);
    }
};

export const markMessagesAsSeen = async (req, res, next) => {
    try {
        const messageId = req.params.id;
        const result = await Message.findOneAndUpdate(
            { _id: messageId, receiverId: req.user._id },
            { seen: true }
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const deleteMessage = async (req, res, next) => {
    try {
        const messageId = req.params.id;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) throw createError.NotFound("Message not found");

        if (!message.senderId.equals(userId)) {
            throw createError.Forbidden("You can only delete your own messages");
        }

        message.isDeleted = true;
        await message.save();

        const receiverSocketId = userSocketMap[message.receiverId];
        const senderSocketId = userSocketMap[userId];

        if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", messageId);
        if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", messageId);

        res.json({ success: true, message: "Message deleted for everyone" });
    } catch (error) {
        next(error);
    }
};



export const getRecentConversations = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const limit = 20; // Or make it query param: parseInt(req.query.limit) || 20

        // Aggregate recent conversations with last message
        const recent = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: userId }, { receiverId: userId }]
                }
            },
            { $sort: { createdAt: -1 } }, // Newest first
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", userId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unseen: {
                        $sum: {
                            $cond: [{
                                $and: [
                                    { $eq: ["$receiverId", userId] },
                                    { $eq: ["$seen", false] }
                                ]
                            }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { "lastMessage.createdAt": -1 } }, // Sort by last message time
            { $limit: limit },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    user: {
                        _id: 1,
                        fullName: 1,
                        profilePic: 1
                    },
                    lastMessage: {
                        _id: 1,
                        text: 1,
                        image: 1,
                        createdAt: 1
                    },
                    unseen: 1
                }
            }
        ]);

        const decryptedConversations = recent.map((conv) => ({
            ...conv,
            lastMessage: {
                ...conv.lastMessage,
                text: conv.lastMessage.text ? decryptMessage(conv.lastMessage.text) : "",
            },
        }));

        res.json({ success: true, conversations: decryptedConversations });
    } catch (error) {
        next(error);
    }
};