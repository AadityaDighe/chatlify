import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, markMessagesAsSeen, sendMessage, deleteMessage, getRecentConversations } from "../controllers/messageController.js";
import { messageRateLimiter } from "../../middleware/messageRateLimiter.js";


import { body } from "express-validator";


const messageRouter = Router();

// Define message-related routes here

messageRouter.get('/recent', authenticate, getRecentConversations);


messageRouter.get('/users', authenticate, getUsersForSidebar);
messageRouter.get('/:id', authenticate, getMessages);
messageRouter.put('/mark/:id', authenticate, markMessagesAsSeen);
// messageRouter.post('/send/:id', authenticate, sendMessage);

messageRouter.post('/send/:id',
    authenticate, [
    body('text').optional().trim().escape(),
    body('image').optional().isString(),
], sendMessage);

messageRouter.delete('/delete/:id', authenticate, deleteMessage);


export default messageRouter;