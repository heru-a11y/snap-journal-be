import express from "express";
import { limiter, corsOptions } from "../middlewares/security-middleware.js";
import { langMiddleware } from "../middlewares/lang-middleware.js";

import { errorMiddleware } from "../middlewares/error-middleware.js";
import { publicRouter } from "../routes/public-api.js";
import { userRouter } from "../routes/user-api.js";
import { authRouter } from "../routes/auth-api.js";
import { journalRouter } from "../routes/journal-api.js";
import { notificationRouter } from "../routes/notification-api.js";
import { feelingRouter } from "../routes/feeling-api.js";
import swaggerDocs from "./swagger.js";

export const web = express();

web.set('trust proxy', 1);

web.use(corsOptions);
web.use(limiter);
web.use(express.json());
web.use(langMiddleware);

swaggerDocs(web);
web.use("/public", express.static("public"));

const apiPrefix = '/api/v1';

web.use(apiPrefix, publicRouter);
web.use(apiPrefix, authRouter);
web.use(apiPrefix, userRouter);
web.use(apiPrefix, journalRouter);
web.use(apiPrefix, notificationRouter);
web.use(apiPrefix, feelingRouter);

web.use(errorMiddleware);