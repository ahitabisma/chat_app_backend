import { NextFunction, Response } from "express";
import { UserRequest } from "../types/user";
import { SendMessageRequest } from "../models/message.model";
import { MessageService } from "../services/message.service";
import logger from "../config/logger";

export class MessageController {
    // Get conversation messages between two users
    static async getConversationMessages(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const otherUserId = parseInt(req.params.otherUserId, 10);

            const messages = await MessageService.getConversationMessages(userId, otherUserId);

            res.status(200).json({
                success: true,
                message: "Conversation messages retrieved successfully",
                data: messages,
            });
        } catch (error) {
            logger.error("Error in MessageController.getConversationMessages: ", error);
            next(error);
        }
    }

    // Send a message from one user to another
    static async sendMessage(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const data = req.body as SendMessageRequest;

            const message = await MessageService.sendMessage(userId, data);

            res.status(200).json({
                success: true,
                message: "Message sent successfully",
                data: message,
            });
        } catch (error) {
            logger.error("Error in MessageController.sendMessage: ", error);
            next(error);
        }
    }

    // Mark a message as read
    static async markMessageAsRead(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const messageId = parseInt(req.params.messageId);

            const message = await MessageService.markAsRead(userId, messageId);

            res.status(200).json({
                success: true,
                message: "Message marked as read successfully",
                data: message,
            });
        } catch (error) {
            logger.error("Error in MessageController.markMessageAsRead: ", error);
            next(error);
        }
    }
}