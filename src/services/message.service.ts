import { prisma } from "../config/database";
import { Message, SendMessageRequest } from "../models/message.model";
import { ResponseError } from "../types/response.error";
import { MessageValidation } from "../validation/message.validation";
import { Validation } from "../validation/validation";

export class MessageService {
    static async sendMessage(senderId: number, req: SendMessageRequest): Promise<Message> {
        const data = Validation.validate(MessageValidation.SEND_MESSAGE, req);

        const receiver = await prisma.user.findUnique({
            where: { id: data.receiverId }
        });

        if (!receiver) {
            throw new ResponseError(404, "Receiver not found", {
                error: ["Receiver not found"]
            });
        }

        const message = await prisma.message.create({
            data: {
                content: data.content,
                type: data.type,
                senderId: senderId,
                receiverId: data.receiverId,
            }
        });

        return message as Message;
    }
}

// Socket handler functions to be used in socket.ts
export async function handleNewMessage(senderId: number, data: SendMessageRequest): Promise<Message> {
    return await MessageService.sendMessage(senderId, data);
}