import express from "express";
import notificationController from "../controllers/notification-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const notificationRouter = new express.Router();

notificationRouter.use(authMiddleware);

notificationRouter.get('/notifications', notificationController.list);
notificationRouter.patch('/notifications/:id/read', notificationController.markAsRead);
notificationRouter.delete('/notifications', notificationController.deleteAll);
notificationRouter.delete('/notifications/:id', notificationController.deleteById);

export { notificationRouter };