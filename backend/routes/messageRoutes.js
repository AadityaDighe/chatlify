import { Router } from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUserforSidebar, markMessagesAsSeen, sendMessage } from "../controllers/messageController.js";

const messageRouter = Router();

// Define message-related routes here
messageRouter.get('/users', protectedRoute, getUserforSidebar);
messageRouter.get('/:id', protectedRoute, getMessages);
messageRouter.put('/mark/:id', protectedRoute, markMessagesAsSeen);
messageRouter.post('/send/:id', protectedRoute, sendMessage);

export default messageRouter;