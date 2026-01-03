import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getUserforSidebar = async (req, res) => {

    try {
        const userId = req.user._id;
        const filterUser = await User.find({ _id: { $ne: userId } }).select('-password');

        const unSeenMessages = {};

        const promises = filterUser.map(async (user) => {
            const messages = await Message.find({
                sender: user._id,
                receiver: userId,
                seen: false
            });

            if (messages.length > 0) {
                unSeenMessages[user._id] = messages.length;
            }
        });
        await Promise.all(promises);

        res.json({
            success: true,
            users: filterUser,
            unseenMessages: unSeenMessages
        });
    } catch (error) {
        console.error("Error in getUserforSidebar:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};



// get all messages for selected users

export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false },
            { $set: { seen: true } }
        );
        res.json({ success: true, messages });

    } catch (error) {
        console.error("Error in getMessages:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// api to mark messages as seen using message ids

export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id } = req.body;
        await Message.findByIdAndUpdate(
            id,
            { seen: true }
        );
        res.json({ success: true, message: "Messages marked as seen" });
    } catch (error) {
        console.error("Error in markMessagesAsSeen:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};



// Send message to selected user

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl = "";
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        // Emit the new message to the receiver if online
        const receiverSocketId = userSocketMap[receiverId];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, message: "Message sent successfully", newMessage });

    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
