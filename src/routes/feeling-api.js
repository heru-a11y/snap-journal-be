import express from "express";
import feelingController from "../controllers/feeling-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { runValidation } from "../middlewares/validation-middleware.js";
import { createFeelingValidation } from "../validations/feeling-validation.js";

const feelingRouter = new express.Router();

feelingRouter.use(authMiddleware); 

feelingRouter.get('/api/v1/feelings/today', feelingController.getToday);
feelingRouter.post('/api/v1/feelings', 
    runValidation(createFeelingValidation), 
    feelingController.setToday
);
feelingRouter.get('/api/v1/feelings/history', feelingController.getHistory);

export { feelingRouter };