import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { MessageController } from "../controllers/message.controller";

export const messageRoutes = Router();

messageRoutes.use([authMiddleware]);

messageRoutes.post("/messages", MessageController.sendMessage);