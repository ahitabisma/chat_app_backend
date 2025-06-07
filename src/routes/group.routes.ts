import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { GroupController } from "../controllers/group.controller";
import { uploadGroupsPhoto } from "../middlewares/upload.middleware";

export const groupRoutes = Router();

groupRoutes.use([authMiddleware]);

groupRoutes.get("/groups", GroupController.getGroupsByUser);
groupRoutes.post("/groups", uploadGroupsPhoto, GroupController.createGroup);