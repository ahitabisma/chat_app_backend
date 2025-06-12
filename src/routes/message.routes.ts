import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { MessageController } from "../controllers/message.controller";

export const messageRoutes = Router();

messageRoutes.use([authMiddleware]);

// Send Message
messageRoutes.post("/messages", MessageController.sendMessage);
// Get Conversation Messages
messageRoutes.get("/messages/:otherUserId", MessageController.getConversationMessages);
// Mark Message as Read
messageRoutes.put("/messages/:messageId/read", MessageController.markMessageAsRead);