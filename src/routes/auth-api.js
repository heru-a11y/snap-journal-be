import express from "express";
import authController from "../controllers/auth-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const authRouter = new express.Router();

authRouter.use(authMiddleware);

authRouter.delete('/auth/logout', authController.logout);

export { authRouter };