import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        text: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        image: {
            type: String,
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        seen: {
            type: Boolean,
            default: false,
            index: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedBy: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index(
    { senderId: 1, receiverId: 1, createdAt: 1 },
    { background: true }
);

messageSchema.index({ receiverId: 1, seen: false });


const Message = mongoose.model("Message", messageSchema);
export default Message;
