// import dotenv from "dotenv";

// dotenv.config();

import 'dotenv/config';

import "../lib/cloudinary.js";

import express from 'express';
import cors from 'cors';
import http from 'http';
import helmet from "helmet";

import { connectDB } from '../lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

import { initSocket, getUserSocketMap } from "./socket/index.js";
import { errorHandler } from "../middleware/errorHandler.js";

const PORT = process.env.PORT || 10000;
const app = express();
const server = http.createServer(app);


// Middleware

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(helmet());

app.use(errorHandler);

// Routes

app.use('/api/status', (req, res) => {
    res.send('Chatlify Backend is running');
});
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);


// DB
await connectDB();

export const io = initSocket(server);  // ← EXPORT io directly like old version
export const userSocketMap = getUserSocketMap();

// start server

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// exporting for vercel

export default server;