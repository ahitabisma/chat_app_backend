import { User } from "./user.model";

export interface Group {
    id: number;
    name: string;
    description?: string;
    photo?: string;
}

export interface CreateGroupRequest {
    name: string;
    description?: string;
    photo?: string;
    ownerId: number;
}

export interface GroupMember {
    user: User;
    group: Group;
    isAdmin: boolean;
    createdAt: Date;
}