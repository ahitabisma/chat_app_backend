import http from "http";
import { Server, Socket } from "socket.io";
import { ResponseError } from "../types/response.error";
import { verifyAccessToken } from "../utils/jwt";
import logger from "./logger";
import { prisma } from "./database";
import { handleNewMessage } from "../services/message.service";

interface SocketWithUser extends Socket {
    userId?: number;
    name?: string;
}

const connectedUsers = new Map<number, SocketWithUser>();

export function setupSocketIO(server: http.Server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "*",
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    io.use(async (socket: SocketWithUser, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new ResponseError(401, "Unauthorized", {
                    error: ["Invalid or expired authentication token"],
                }));
            }

            const decoded = verifyAccessToken(token);

            socket.userId = decoded.id;
            socket.name = decoded.name;

            next();
        } catch (error) {
            logger.error("Socket authentication error:", error);

            next(new ResponseError(401, "Unauthorized", {
                error: ["Invalid or expired authentication token"],
            }));
        }
    });

    io.on("connection", (socket: SocketWithUser) => {
        if (socket.userId) {
            connectedUsers.set(socket.userId, socket);

            logger.info(`User ${socket.name} (${socket.userId}) connected`);

            // Update user's online status in database
            updateUserOnlineStatus(socket.userId, true);

            // Emit to all users that this user is online
            io.emit('user:status', {
                userId: socket.userId,
                status: 'online'
            });
        }

        // Handle disconnect
        socket.on('disconnect', () => {
            if (socket.userId) {
                logger.info(`User disconnected: ${socket.name} (${socket.userId})`);

                // Remove from connected users map
                connectedUsers.delete(socket.userId);

                // Update user's online status in database
                updateUserOnlineStatus(socket.userId, false);

                // Emit to all users that this user is offline
                io.emit('user:status', {
                    userId: socket.userId,
                    status: 'offline'
                });
            }
        });

        // Setup message handlers
        setupMessageHandlers(io, socket);

        // Setup typing indicator handlers
        setupTypingHandlers(io, socket);

        // Setup read receipt handlers
        // setupReadReceiptHandlers(io, socket);
    });

    return io;
}

// Update user's online status in the database
async function updateUserOnlineStatus(userId: number, isOnline: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isOnline,
                lastSeen: isOnline ? undefined : new Date()
            }
        });
    } catch (error) {
        logger.error(`Error updating online status for user ${userId}:`, error);
    }
}

// Check if a user is connected
export function isUserConnected(userId: number): boolean {
    return connectedUsers.has(userId);
}

// Get socket ID for a specific user
export function getUserSocketId(userId: number): string | undefined {
    const userSocket = connectedUsers.get(userId);
    return userSocket?.id;
}

// Message handlers
function setupMessageHandlers(io: Server, socket: SocketWithUser) {
    // Handle private messages
    socket.on('message:send', async (data) => {
        try {
            // Will implement in message service
            const savedMessage = await handleNewMessage(socket.userId!, data);

            // Emit message to recipient if online
            const recipientSocketId = getUserSocketId(data.receiverId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('message:receive', savedMessage);
            }

            // Confirm message saved to sender
            socket.emit('message:sent', savedMessage);

        } catch (error) {
            logger.error('Error handling new message:', error);
            socket.emit('message:error', {
                error: 'Failed to send message',
                originalMessage: data
            });
        }
    });

    // Handle group messages
    // socket.on('message:group', async (data) => {
    //     try {
    //         // Will implement in message service
    //         const savedMessage = await handleNewGroupMessage(socket.userId!, data);

    //         // Emit to all sockets in the group room
    //         io.to(`group:${data.groupId}`).emit('message:group', savedMessage);

    //         // Confirm message saved to sender
    //         socket.emit('message:sent', savedMessage);

    //     } catch (error) {
    //         logger.error('Error handling new group message:', error);
    //         socket.emit('message:error', {
    //             error: 'Failed to send group message',
    //             originalMessage: data
    //         });
    //     }
    // });
}

// Typing indicators
function setupTypingHandlers(io: Server, socket: SocketWithUser) {
    // User is typing in a private chat
    socket.on('typing:start', (data: { receiverId: number }) => {
        const recipientSocketId = getUserSocketId(data.receiverId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('typing:start', {
                userId: socket.userId
            });
        }
    });

    socket.on('typing:stop', (data: { receiverId: number }) => {
        const recipientSocketId = getUserSocketId(data.receiverId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('typing:stop', {
                userId: socket.userId
            });
        }
    });

    // User is typing in a group chat
    socket.on('typing:group:start', (data: { groupId: number }) => {
        socket.to(`group:${data.groupId}`).emit('typing:group:start', {
            userId: socket.userId,
            name: socket.name
        });
    });

    socket.on('typing:group:stop', (data: { groupId: number }) => {
        socket.to(`group:${data.groupId}`).emit('typing:group:stop', {
            userId: socket.userId
        });
    });
}

// Read receipt handlers
// function setupReadReceiptHandlers(io: Server, socket: SocketWithUser) {
//     socket.on('message:read', async (data: { messageId: string }) => {
//         try {
//             const message = await markMessageAsRead(data.messageId, socket.userId!);

//             // Notify the original sender their message was read
//             const senderSocketId = getUserSocketId(message.senderId);
//             if (senderSocketId) {
//                 io.to(senderSocketId).emit('message:read', {
//                     messageId: data.messageId,
//                     readAt: message.readAt
//                 });
//             }
//         } catch (error) {
//             logger.error('Error marking message as read:', error);
//         }
//     });
// }