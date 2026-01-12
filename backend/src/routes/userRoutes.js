import { Router } from "express";
import { checkAuth, forgotPassword, login, resetPassword, signUp, updateProfile } from "../controllers/userController.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { messageRateLimiter } from "../../middleware/messageRateLimiter.js";

const router = Router();

router.post("/signup", messageRateLimiter, signUp);
router.post("/login", messageRateLimiter, login);
router.get("/check", checkAuth);
router.put("/update-profile", authenticate, updateProfile);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
