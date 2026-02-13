import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import deleteController from "../controllers/delete-controller.js";

const deleteRouter = new express.Router();

deleteRouter.use(authMiddleware);

deleteRouter.delete('/api/v1/uploads/file', deleteController.removeFile);

export { deleteRouter };