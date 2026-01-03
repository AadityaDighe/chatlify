import { Router } from "express";
import { checkAuth, login, signUp, updateProfile } from "../controllers/userController.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const userRouter = Router();

// Define user-related routes here
userRouter.post('/signup', signUp);
userRouter.post('/login', login);
userRouter.put('/update-profile', protectedRoute, updateProfile);
userRouter.get('/check', protectedRoute, checkAuth);

export default userRouter;