import { Server } from "socket.io";

export let io = null;
export const userSocketMap = {}; // { userId: socketId }

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true
        },
    });

    io.on("connection", (socket) => {
        const rawUserId = socket.handshake.query.userId;
        const userId = typeof rawUserId === "string" ? rawUserId : null;

        if (!userId) {
            socket.disconnect(true);
            return;
        }

        userSocketMap[userId] = socket.id;
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // ← ADD TYPING EVENTS
        socket.on("typing", (receiverId) => {
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", userId);
            }
        });

        socket.on("stopTyping", (receiverId) => {
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStopTyping", userId);
            }
        });

        socket.on("disconnect", () => {
            if (userSocketMap[userId] === socket.id) {
                delete userSocketMap[userId];
            }

            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });

    return io;
};

export const getIO = () => io || null;
export const getUserSocketMap = () => userSocketMap;
