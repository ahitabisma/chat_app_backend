import { NextFunction, Response } from "express";
import { UserRequest } from "../types/user";
import { GroupService } from "../services/group.service";
import { CreateGroupRequest } from "../models/group.model";

export class GroupController {
    static async getGroupsByUser(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const response = await GroupService.getGroupsByUser(req);

            res.status(200).json({
                success: true,
                message: "Groups retrieved successfully",
                data: response,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createGroup(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const data = req.body as CreateGroupRequest;

            if (req.file) {
                data.photo = req.file.filename;
            }

            const response = await GroupService.createGroup(data, req);

            res.status(201).json({
                success: true,
                message: "Group created successfully",
                data: response,
            });
        } catch (error) {
            next(error);
        }
    }
}