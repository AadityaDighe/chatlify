// import Message from "../models/Message.js";
// import User from "../models/User.js";
// import cloudinary from "../../lib/cloudinary.js";
// import { io, userSocketMap } from "../server.js"
// import mongoose from "mongoose";

// // Max file size: 50MB
// const MAX_FILE_SIZE = 20 * 1024 * 1024;

// // Validate base64 file (handles images, videos, documents)
// const validateBase64File = (base64) => {
//     const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
//     if (!matches || matches.length !== 3) {
//         throw new Error("Invalid file format");
//     }

//     const mimeType = matches[1];
//     const base64Data = matches[2];

//     // Supported MIME types
//     const allowedMimeTypes = [
//         // Images
//         "image/jpeg",
//         "image/png",
//         "image/webp",
//         "image/gif",
//         // Videos
//         "video/mp4",
//         "video/webm",
//         "video/quicktime",
//         // Documents
//         "application/pdf",
//         "application/msword", // .doc
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
//         "application/vnd.ms-powerpoint",
//         "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
//         "application/vnd.ms-excel",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
//         "text/plain", // .txt
//     ];

//     if (!allowedMimeTypes.includes(mimeType)) {
//         throw new Error("Unsupported file type");
//     }

//     // Approximate size calculation
//     let sizeInBytes = (base64Data.length * 3) / 4;
//     if (base64Data.endsWith("==")) sizeInBytes -= 2;
//     else if (base64Data.endsWith("=")) sizeInBytes -= 1;

//     if (sizeInBytes > MAX_FILE_SIZE) {
//         throw new Error("File too large (max 20MB)");
//     }

//     return { mimeType };
// };



// // Get Users For Sidebar

// export const getUsersForSidebar = async (req, res) => {
//     try {
//         const myId = req.user._id;

//         const users = await User.find({ _id: { $ne: myId } })
//             .select("fullName profilePic")
//             .lean();

//         const unseenCounts = await Message.aggregate([
//             {
//                 $match: {
//                     receiverId: myId,
//                     seen: false,
//                 },
//             },
//             {
//                 $group: {
//                     _id: "$senderId",
//                     count: { $sum: 1 },
//                 },
//             },
//         ]);

//         const unseenMap = {};
//         unseenCounts.forEach((u) => {
//             unseenMap[u._id] = u.count;
//         });

//         res.json({
//             success: true,
//             users,
//             unseenMessages: unseenMap,
//         });
//     } catch (error) {
//         console.error("getUsersForSidebar:", error.message);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };




// // Get Messages


// export const getMessages = async (req, res) => {
//     try {
//         const myId = req.user._id;
//         const otherUserId = req.params.id;

//         if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
//             return res.status(400).json({ success: false, message: "Invalid user ID" });
//         }

//         const messages = await Message.find({
//             $or: [
//                 { senderId: myId, receiverId: otherUserId },
//                 { senderId: otherUserId, receiverId: myId },
//             ],
//             isDeleted: false
//         })
//             .sort({ createdAt: 1 })
//             .lean();

//         await Message.updateMany(
//             { senderId: otherUserId, receiverId: myId, seen: false },
//             { $set: { seen: true } }
//         );

//         res.json({ success: true, messages });
//     } catch (error) {
//         console.error("getMessages:", error.message);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };



// // Send Messages


// export const sendMessage = async (req, res) => {
//     try {
//         const senderId = req.user._id.toString();
//         const receiverId = req.params.id;
//         // const { text, image } = req.body;
//         const { text, file, fileName, fileType } = req.body;


//         const trimmedText = text?.trim();

//         // if (!trimmedText && !image) {
//         //     return res.status(400).json({ success: false, message: "Message cannot be empty" });
//         // }

//         if (!trimmedText && !file) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Message cannot be empty"
//             });
//         }

//         if (senderId === receiverId) {
//             return res.status(400).json({ success: false, message: "Cannot message yourself" });
//         }

//         const senderSocketId = userSocketMap[senderId];
//         const receiverSocketId = userSocketMap[receiverId];

//         // let imageUrl;
//         // let thumbnailUrl;

//         let fileUrl = "";
//         let uploadedFileType = "";
//         let publicId = null;
//         let uploadResponse = null;

//         // if (image) {
//         //     try {
//         //         validateBase64File(image);
//         //     } catch (err) {
//         //         return res.status(400).json({
//         //             success: false,
//         //             message: err.message,
//         //         });
//         //     }

//         //     if (senderSocketId) {
//         //         io.to(senderSocketId).emit("upload:started");
//         //     }

//         //     const upload = await cloudinary.uploader.upload(image, {
//         //         folder: "chat_images",
//         //         resource_type: "auto",
//         //         eager: [
//         //             { width: 300, height: 300, crop: "fill", format: "jpg" }
//         //         ],
//         //     });

//         //     imageUrl = upload.secure_url;
//         //     thumbnailUrl = upload.eager?.[0]?.secure_url;

//         //     if (senderSocketId) {
//         //         io.to(senderSocketId).emit("upload:completed");
//         //     }
//         // }

//         if (file) {
//             // Validate file
//             const { mimeType } = validateBase64File(file);

//             // Upload progress
//             if (senderSocketId) {
//                 io.to(senderSocketId).emit("upload:started");
//             }

//             console.log("Generated download URL:", fileUrl);
//             console.log("Original filename:", fileName);

//             const resourceType =
//                 mimeType.startsWith("video/") ? "video" :
//                     mimeType.startsWith("image/") ? "image" : "raw";

//             const uploadResponse = await cloudinary.uploader.upload(file, {
//                 folder: "chat_files",
//                 resource_type: resourceType,
//                 public_id: fileName ? fileName.replace(/[^a-zA-Z0-9._-]/g, '_') : undefined,
//                 overwrite: false,
//                 use_filename: true,
//                 unique_filename: false,
//             });

//             publicId = uploadResponse.public_id;

//             // fileUrl = uploadResponse.secure_url + `?fl_attachment=true&fl_attachment_filename=${encodeURIComponent(fileName)}`;

//             // fileUrl = cloudinary.url(uploadResponse.public_id, {
//             //     resource_type: "raw",
//             //     attachment: true,
//             //     // filename: fileName || "document",
//             // });

//             uploadedFileType =
//                 mimeType.startsWith("image/") ? "image" :
//                     mimeType.startsWith("video/") ? "video" : "document";

//             if (senderSocketId) {
//                 io.to(senderSocketId).emit("upload:completed");
//             }
//         }



//         const message = await Message.create({
//             senderId,
//             receiverId,
//             text: trimmedText || "",
//             // image: imageUrl

//             file: uploadResponse ? uploadResponse.secure_url : undefined,
//             fileType: uploadResponse ? uploadedFileType : undefined,
//             fileName: fileName || undefined,

//             // thumbnail: thumbnailUrl,
//             // status: "sent",
//         });


//         if (receiverSocketId) {
//             io.to(receiverSocketId).emit("newMessage", message);
//         }

//         if (senderSocketId) {
//             io.to(senderSocketId).emit("newMessage", message);
//         }

//         res.json({ success: true, newMessage: message });
//     }
//     catch (error) {
//         console.error("sendMessage ERROR:", error);  // ← Add full error logging
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Set seen or not seen to show count of messages on sidebar

// export const markMessagesAsSeen = async (req, res) => {
//     try {
//         const messageId = req.params.id;

//         await Message.findOneAndUpdate(
//             { _id: messageId, receiverId: req.user._id },
//             { seen: true }
//         );

//         res.json({ success: true });
//     } catch (error) {
//         console.error("markMessagesAsSeen:", error.message);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };



// // export const downloadFile = async (req, res) => {
// //     try {
// //         const { publicId } = req.params;
// //         const fileName = req.query.filename || "document";

// //         // Fetch from Cloudinary
// //         const response = await fetch(`https://res.cloudinary.com/dwslglx8q/raw/upload/${publicId}`);

// //         if (!response.ok) {
// //             return res.status(404).json({ success: false, message: "File not found" });
// //         }

// //         let contentType = response.headers.get("content-type") || "application/octet-stream";
// //         if (fileName.endsWith(".pdf")) {
// //             contentType = "application/pdf";
// //         } else if (fileName.endsWith(".docx")) {
// //             contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
// //         }

// //         // Set headers to force download
// //         res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
// //         res.setHeader("Content-Type", contentType);

// //         // Pipe the file to response
// //         response.body.pipe(res);
// //     } catch (error) {
// //         console.error("Download error:", error);
// //         res.status(500).json({ success: false, message: "Download failed" });
// //     }
// // };





// export const downloadFile = async (req, res) => {
//     try {
//         const { publicId } = req.params;
//         let fileName = req.query.filename || "document";

//         // Force .pdf extension if it's a PDF (based on publicId or filename)
//         if (publicId.includes('.pdf') || (fileName.toLowerCase().endsWith('.pdf'))) {
//             if (!fileName.endsWith('.pdf')) fileName += '.pdf';
//         }

//         const cloudinaryUrl = `https://res.cloudinary.com/dwslglx8q/raw/upload/${publicId}`;
//         const response = await fetch(cloudinaryUrl);

//         if (!response.ok) {
//             return res.status(404).json({ success: false, message: "File not found" });
//         }

//         // FORCE correct Content-Type
//         let contentType = "application/octet-stream"; // fallback
//         if (fileName.toLowerCase().endsWith('.pdf')) {
//             contentType = "application/pdf";
//         } else if (fileName.toLowerCase().endsWith('.docx')) {
//             contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
//         } else if (fileName.toLowerCase().endsWith('.doc')) {
//             contentType = "application/msword";
//         } else if (fileName.toLowerCase().endsWith('.txt')) {
//             contentType = "text/plain";
//         }

//         // Set headers
//         res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
//         res.setHeader("Content-Type", contentType);
//         res.setHeader("Content-Transfer-Encoding", "binary");

//         // Stream the file
//         response.body.pipe(res);
//     } catch (error) {
//         console.error("Download error:", error);
//         res.status(500).json({ success: false, message: "Download failed" });
//     }
// };



// // Delete Messages


// export const deleteMessage = async (req, res) => {
//     try {
//         const { id: messageId } = req.params;
//         const userId = req.user._id;

//         const message = await Message.findById(messageId);

//         if (!message) {
//             return res.status(404).json({ success: false, message: "Message not found" });
//         }

//         // Only the SENDER can delete the message
//         if (!message.senderId.equals(userId)) {
//             return res.status(403).json({ success: false, message: "You can only delete your own messages" });
//         }

//         // Optional: Add time limit (e.g., only delete within 10 minutes)
//         // const timeDiff = Date.now() - message.createdAt;
//         // if (timeDiff > 10 * 60 * 1000) { // 10 minutes
//         //     return res.status(400).json({ success: false, message: "Too late to delete" });
//         // }

//         // Mark as deleted for everyone
//         message.isDeleted = true;
//         await message.save();

//         // Notify BOTH users in real-time
//         const receiverSocketId = userSocketMap[message.receiverId];
//         const senderSocketId = userSocketMap[userId];

//         if (receiverSocketId) {
//             io.to(receiverSocketId).emit("messageDeleted", messageId);
//         }
//         if (senderSocketId) {
//             io.to(senderSocketId).emit("messageDeleted", messageId);
//         }

//         res.json({ success: true, message: "Message deleted for everyone" });

//     } catch (error) {
//         console.error("deleteMessage ERROR:", error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };



















// import Message from "../models/Message.js";
// import User from "../models/User.js";
// import cloudinary from "../../lib/cloudinary.js";
// import { io, userSocketMap } from "../server.js";
// import mongoose from "mongoose";

// // Max image size: 5MB
// const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// // Validate base64 image
// const validateBase64Image = (base64) => {
//     const matches = base64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
//     if (!matches || matches.length !== 3) {
//         throw new Error("Invalid image format");
//     }

//     const mimeType = matches[1]; // e.g. image/png
//     const base64Data = matches[2];

//     const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

//     if (!allowedMimeTypes.includes(mimeType)) {
//         throw new Error("Only JPG, PNG, WEBP, and GIF images are allowed");
//     }

//     const sizeInBytes = (base64Data.length * 3) / 4;
//     if (sizeInBytes > MAX_IMAGE_SIZE) {
//         throw new Error("Image too large (max 5MB)");
//     }

//     return mimeType;
// };

// // Get Users For Sidebar
// export const getUsersForSidebar = async (req, res) => {
//     try {
//         const myId = req.user._id;

//         const users = await User.find({ _id: { $ne: myId } })
//             .select("fullName profilePic")
//             .lean();

//         const unseenCounts = await Message.aggregate([
//             { $match: { receiverId: myId, seen: false } },
//             { $group: { _id: "$senderId", count: { $sum: 1 } } },
//         ]);

//         const unseenMap = {};
//         unseenCounts.forEach((u) => (unseenMap[u._id] = u.count));

//         res.json({ success: true, users, unseenMessages: unseenMap });
//         // } catch (error) {
//         //     console.error("getUsersForSidebar:", error.message);
//         //     res.status(500).json({ success: false, message: "Server error" });
//         // }

//     } catch (error) {
//         next(error); // ← Pass to global handler
//     }
// };

// // Get Messages
// export const getMessages = async (req, res) => {
//     try {
//         const myId = req.user._id;
//         const otherUserId = req.params.id;

//         if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
//             return res.status(400).json({ success: false, message: "Invalid user ID" });
//         }

//         const messages = await Message.find({
//             $or: [
//                 { senderId: myId, receiverId: otherUserId },
//                 { senderId: otherUserId, receiverId: myId },
//             ],
//             isDeleted: false,
//         })
//             .sort({ createdAt: 1 })
//             .lean();

//         await Message.updateMany(
//             { senderId: otherUserId, receiverId: myId, seen: false },
//             { $set: { seen: true } }
//         );

//         res.json({ success: true, messages });
//         // } catch (error) {
//         //     console.error("getMessages:", error.message);
//         //     res.status(500).json({ success: false, message: "Server error" });
//         // }

//     } catch (error) {
//         next(error); // ← Pass to global handler
//     }
// };

// // Send Message (Text + Image only)
// export const sendMessage = async (req, res) => {
//     try {
//         const senderId = req.user._id.toString();
//         const receiverId = req.params.id;
//         const { text, image } = req.body; // Only text and image

//         const trimmedText = text?.trim();

//         if (!trimmedText && !image) {
//             return res.status(400).json({ success: false, message: "Message cannot be empty" });
//         }

//         if (senderId === receiverId) {
//             return res.status(400).json({ success: false, message: "Cannot message yourself" });
//         }

//         const senderSocketId = userSocketMap[senderId];
//         const receiverSocketId = userSocketMap[receiverId];

//         let imageUrl = "";

//         if (image) {
//             validateBase64Image(image); // Validates format and size

//             if (senderSocketId) {
//                 io.to(senderSocketId).emit("upload:started");
//             }

//             const uploadResponse = await cloudinary.uploader.upload(image, {
//                 folder: "chat_images",
//                 resource_type: "image",
//             });

//             imageUrl = uploadResponse.secure_url;

//             if (senderSocketId) {
//                 io.to(senderSocketId).emit("upload:completed");
//             }
//         }

//         const message = await Message.create({
//             senderId,
//             receiverId,
//             text: trimmedText || "",
//             image: imageUrl || undefined,
//         });

//         if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", message);
//         if (senderSocketId) io.to(senderSocketId).emit("newMessage", message);

//         res.json({ success: true, newMessage: message });
//         // } catch (error) {
//         //     console.error("sendMessage ERROR:", error);
//         //     res.status(500).json({ success: false, message: error.message || "Server error" });
//         // }

//     } catch (error) {
//         next(error); // ← Pass to global handler
//     }
// };

// // Mark messages as seen
// export const markMessagesAsSeen = async (req, res) => {
//     try {
//         const messageId = req.params.id;
//         await Message.findOneAndUpdate(
//             { _id: messageId, receiverId: req.user._id },
//             { seen: true }
//         );
//         res.json({ success: true });
//         // } catch (error) {
//         //     console.error("markMessagesAsSeen:", error.message);
//         //     res.status(500).json({ success: false, message: "Server error" });
//         // }

//     } catch (error) {
//         next(error); // ← Pass to global handler
//     }
// };

// // Delete Message
// export const deleteMessage = async (req, res) => {
//     try {
//         const { id: messageId } = req.params;
//         const userId = req.user._id;

//         const message = await Message.findById(messageId);
//         if (!message) {
//             return res.status(404).json({ success: false, message: "Message not found" });
//         }

//         if (!message.senderId.equals(userId)) {
//             return res.status(403).json({ success: false, message: "You can only delete your own messages" });
//         }

//         message.isDeleted = true;
//         await message.save();

//         const receiverSocketId = userSocketMap[message.receiverId];
//         const senderSocketId = userSocketMap[userId];

//         if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", messageId);
//         if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", messageId);

//         res.json({ success: true, message: "Message deleted for everyone" });
//         // } catch (error) {
//         //     console.error("deleteMessage ERROR:", error);
//         //     res.status(500).json({ success: false, message: "Server error" });
//         // }

//     } catch (error) {
//         next(error); // ← Pass to global handler
//     }
// };















// After error handler




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