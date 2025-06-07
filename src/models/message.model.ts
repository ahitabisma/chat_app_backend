enum MessageType {
    TEXT = 'TEXT',
    // IMAGE = 'IMAGE',
    FILE = 'FILE',
    // AUDIO = 'AUDIO'
}

export interface File {
    id: number;
    messageId: number;
    uploaderId: number;
    fileName: string;
    path: string;
    mimeType: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface FileRequest {
    fileName: string;
    path: string;
    mimeType: string;
    size: number;
}

export interface Message {
    id: number;
    content: string;
    type: MessageType;
    senderId: number;
    receiverId?: number;
    groupId?: number;
    // file?: File | undefined;
    isRead: boolean;
    readAt?: Date;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SendMessageRequest {
    content: string;
    type: MessageType | "TEXT";
    receiverId: number;
    file?: FileRequest | undefined;
    groupId?: number;
}