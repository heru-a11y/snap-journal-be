import express from "express";
import cronController from "../controllers/cron-controller.js";

const cronRouter = new express.Router();

cronRouter.post('/api/test-cron', cronController.triggerReminder);

export { cronRouter };