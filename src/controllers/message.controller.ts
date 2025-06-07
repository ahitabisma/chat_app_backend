import { NextFunction, Response } from "express";
import { UserRequest } from "../types/user";
import { SendMessageRequest } from "../models/message.model";
import { MessageService } from "../services/message.service";
import logger from "../config/logger";

export class MessageController {
    static async sendMessage(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const data = req.body as SendMessageRequest;

            const message = await MessageService.sendMessage(userId, data);

            res.status(201).json({
                success: true,
                message: "Message sent successfully",
                data: message,
            });
        } catch (error) {
            logger.error("Error in MessageController.sendMessage: ", error);
            next(error);
        }
    }
}