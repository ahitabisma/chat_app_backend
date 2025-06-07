import { Role } from "../../generated/prisma";

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    photo?: string;
    role: Role;
    isOnline?: boolean;
    lastSeen?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    photo?: string;
    role: Role | "USER";
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    password?: string;
    photo?: string;
}