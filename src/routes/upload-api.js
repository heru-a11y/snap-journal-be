import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { multipartMiddleware } from "../middlewares/multipart-middleware.js";
import uploadController from "../controllers/upload-controller.js";

const uploadRouter = new express.Router();

uploadRouter.use(authMiddleware);

uploadRouter.post('/api/v1/uploads/editor', 
    multipartMiddleware, 
    uploadController.uploadEditorImage
);

export { uploadRouter };