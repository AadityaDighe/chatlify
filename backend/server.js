import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv/config';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';


const PORT = process.env.PORT || 5000;

// Server setup

const app = express();
const server = http.createServer(app);

// Initialize Socket.io

export const io = new Server(server,
    {
        cors: {
            origin: "*",
        }
    });


// store online users

export const userSocketMap = {}  // {userId: socketId}


// socket.io connection handler

io.on('connection', (socket) => {

    const userId = socket.handshake.query.userId;

    console.log('A user connected:', userId);
    // Handle socket events here

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    // Emit Online Users to all connected clients

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('User disconnected:', userId, socket.id);
        delete userSocketMap[userId];

        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});


// Middleware

app.use(cors());
app.use(express.json({ limit: '4mb' }));

// Routes

app.use('/api/status', (req, res) => {
    res.send('Chatlify Backend is running');
});
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);


// Database connection
await connectDB();


// Start server

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});