import { prisma } from "../config/database";
import logger from "../config/logger";
import { CreateGroupRequest, Group } from "../models/group.model";
import { UserRequest } from "../types/user";
import { GroupValidation } from "../validation/group.validation";
import { Validation } from "../validation/validation";

export class GroupService {
    static async getGroupsByUser(req: UserRequest): Promise<Group[]> {
        const userId = req.user!.id;

        const groups = await prisma.group.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    {
                        members: {
                            some: {
                                userId: userId
                            }
                        }
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                description: true,
                photo: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return groups as Group[];
    }

    static async createGroup(req: CreateGroupRequest, userReq: UserRequest): Promise<Group> {
        const userId = userReq.user!.id;
        const data = Validation.validate(GroupValidation.CREATE, req);

        const group = await prisma.group.create({
            data: {
                name: data.name,
                description: data.description,
                photo: data.photo,
                ownerId: userId
            }
        });

        return group as Group;
    }
}