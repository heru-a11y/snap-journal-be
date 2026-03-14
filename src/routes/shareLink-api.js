import express from "express";
import shareLinkController from "../controllers/shareLink-controller.js";
import { 
  createShareLinkValidation,
  accessLinkValidation,
  requestAccessValidation,
  revokeShareLinkValidation,
  approveAccessValidation,
  denyAccessValidation
} from "../validations/sharelink-validation.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { runValidation } from "../middlewares/validation-middleware.js";

const router = express.Router();

router.post(
    "/share-links",
    authMiddleware,
    runValidation(createShareLinkValidation),
    shareLinkController.createShareLink
);

router.patch(
    "/share-links/:token/revoke",
    authMiddleware,
    runValidation(revokeShareLinkValidation),
    shareLinkController.revokeShareLink
);

router.get(
    "/l/:token",
    runValidation(accessLinkValidation),
    shareLinkController.accessLink
);

router.post(
    "/l/:token/request",
    authMiddleware,
    runValidation(requestAccessValidation),
    shareLinkController.requestAccess
);

router.patch(
    "/access-requests/:requestId/approve",
    authMiddleware,
    runValidation(approveAccessValidation),
    shareLinkController.approveAccessRequest
);

router.patch(
    "/access-requests/:requestId/deny",
    authMiddleware,
    runValidation(denyAccessValidation),
    shareLinkController.denyAccessRequest
);

export const shareLinkRouter = router;