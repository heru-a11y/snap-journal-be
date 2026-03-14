import * as shareLinkService from "../services/sharelink/shareLink-service.js";

const createShareLink = async (req, res, next) => {
    try {
        const { journalId, shareType, expiresAt } = req.body;

        const result = await shareLinkService.createShareLinkService(
            req.user.uid,
            journalId,
            shareType,
            expiresAt
        );

        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const accessLink = async (req, res, next) => {
    try {
        const result = await shareLinkService.validateShareLinkService(
            req.params.token,
            req.user?.uid
        );

        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const requestAccess = async (req, res, next) => {
    try {
        const result = await shareLinkService.requestAccessService(
            req.params.token,
            req.user.uid
        );

        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const revokeShareLink = async (req, res, next) => {
    try {
        const result = await shareLinkService.revokeShareLinkService(
            req.user.uid,
            req.params.token
        );

        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const approveAccessRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        await shareLinkService.approveAccessService(requestId);
        res.status(200).json({ data: { success: true, status: "approved" } });
    } catch (e) {
        next(e);
    }
};

const denyAccessRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        await shareLinkService.denyAccessService(requestId);
        res.status(200).json({ data: { success: true, status: "denied" } });
    } catch (e) {
        next(e);
    }
};

export default {
    createShareLink,
    accessLink,
    requestAccess,
    revokeShareLink,
    approveAccessRequest,
    denyAccessRequest
};