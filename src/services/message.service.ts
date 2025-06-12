import { prisma } from "../config/database";
import { Message, SendMessageRequest } from "../models/message.model";
import { ResponseError } from "../types/response.error";
import { MessageValidation } from "../validation/message.validation";
import { Validation } from "../validation/validation";

export class MessageService {
    // Send a message from one user to another
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

    // Get conversation messages between two users
    static async getConversationMessages(userId: number, otherUserId: number) {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                sender: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        return messages.map(msg => {
            return {
                ...msg,
                senderName: msg.sender.name,
                createdAt: msg.createdAt.toISOString(),
                updatedAt: msg.updatedAt.toISOString(),
                readAt: msg.readAt ? msg.readAt.toISOString() : null
            };
        })
    }

    // Mark a message as read
    static async markAsRead(messageId: number, userId: number) {
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            throw new ResponseError(404, "Message not found", {
                error: ["Message not found"]
            });
        }

        // Only mark as read if the user is the receiver
        if (message.receiverId !== userId) {
            throw new ResponseError(403, "You are not authorized to mark this message as read", {
                error: ["You are not authorized to mark this message as read"]
            });
        }

        // Update the message to mark it as read
        const update = await prisma.message.update({
            where: { id: messageId },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        return {
            ...update,
            readAt: update.readAt ? update.readAt.toISOString() : null,
            createdAt: update.createdAt.toISOString(),
            updatedAt: update.updatedAt.toISOString()
        }
    }
}

// Socket handler functions to be used in socket.ts
export async function handleNewMessage(senderId: number, data: SendMessageRequest): Promise<Message> {
    return await MessageService.sendMessage(senderId, data);
}

export async function markMessageAsRead(messageId: number, userId: number) {
    return await MessageService.markAsRead(messageId, userId);
} 