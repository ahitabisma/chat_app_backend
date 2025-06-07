import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeAdmin } from "../middlewares/authorize.middleware";
import { UserController } from "../controllers/user.controller";
import { uploadUsersPhoto } from "../middlewares/upload.middleware";

export const userRoutes = Router();

userRoutes.use([authMiddleware, authorizeAdmin]);

userRoutes.get("/users", UserController.getUsers);
userRoutes.post("/users", uploadUsersPhoto, UserController.createUser);
userRoutes.get("/users/:id", UserController.findUserById);
userRoutes.put("/users/:id", uploadUsersPhoto, UserController.updateUser);
userRoutes.delete("/users/:id", UserController.deleteUser);