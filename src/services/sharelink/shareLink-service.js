import {
    createShareLink,
    getShareLinkByToken,
    revokeShareLink as revokeShareLinkRepo,
    createAccessRequest,
    getAccessRequest,
    updateAccessRequestStatus
} from "../../repositories/shareLink-repository.js";

import {
    SHARE_TYPE,
    ACCESS_STATUS,
    SHARE_LINK_DEFAULTS,
    SHARE_LINK_MESSAGES
} from "../../constants/sharelinks-constants.js";

import { generateShareToken } from "../../utils/shareLinkTokenGenerator.js";
import { getJournalById } from "../../repositories/journal-repository.js";
import { getAccessRequestsByToken } from "../../repositories/shareLink-repository.js";

export const createShareLinkService = async (
    userId,
    journalId,
    shareType,
    expiresAt = null
) => {
    const journal = await getJournalById(journalId);
    if (!journal) {
        throw new Error("Journal not found");
    }
    
    if (journal.user_id !== userId) {
        throw new Error("You do not have permission to share this journal");
    }

    const token = generateShareToken(shareType);

    let expiration = expiresAt
        ? new Date(expiresAt)
        : new Date(Date.now() + SHARE_LINK_DEFAULTS.EXPIRE_DAYS * 86400000);

    const maxExpire = new Date(
        Date.now() + SHARE_LINK_DEFAULTS.MAX_EXPIRE_DAYS * 86400000
    );

    if (expiration > maxExpire) {
        throw new Error("Expiration cannot exceed 30 days");
    }

    const data = {
        user_id: userId,
        journalId,
        shareType,
        createdAt: new Date(),
        expiresAt: expiration,
        revoked: false
    };

    await createShareLink(token, data);

    return {
        token,
        expiresAt: expiration
    };
};

export const validateShareLinkService = async (token, userId = null) => {
    const shareLink = await getShareLinkByToken(token);

    if (!shareLink) {
        throw new Error(SHARE_LINK_MESSAGES.en.LINK_NOT_FOUND);
    }

    if (shareLink.revoked) {
        throw new Error(SHARE_LINK_MESSAGES.en.LINK_REVOKED);
    }

    const journal = await getJournalById(shareLink.journalId);
    if (!journal) {
        throw new Error("Journal not found");
    }

    let expires;
    if (!shareLink.expiresAt) throw new Error("Expiration date invalid");
    if (typeof shareLink.expiresAt.toDate === "function") {
        expires = shareLink.expiresAt.toDate();
    } else {
        expires = new Date(shareLink.expiresAt);
    }

    if (expires < new Date()) {
        throw new Error(SHARE_LINK_MESSAGES.en.LINK_EXPIRED);
    }

    if (shareLink.shareType === SHARE_TYPE.PUBLIC) {
        return {
            access: true,
            journalId: shareLink.journalId
        };
    }

    if (!userId) {
        return {
            access: false,
            reason: "login_required"
        };
    }

    const request = await getAccessRequest(token, userId);

    if (!request) {
        return {
            access: false,
            reason: "request_required"
        };
    }

    if (request.status === ACCESS_STATUS.PENDING) {
        return {
            access: false,
            reason: "pending"
        };
    }

    if (request.status === ACCESS_STATUS.DENIED) {
        return {
            access: false,
            reason: "denied"
        };
    }

    return {
        access: true,
        journalId: shareLink.journalId
    };
};

export const requestAccessService = async (token, requesterId) => {
    const existingRequest = await getAccessRequest(token, requesterId);

    if (existingRequest) {
        return existingRequest;
    }

    const shareLink = await getShareLinkByToken(token);

    if (!shareLink) {
        throw new Error(SHARE_LINK_MESSAGES.en.LINK_NOT_FOUND);
    }

    if (requesterId === shareLink.userId) {
        throw new Error(SHARE_LINK_MESSAGES.en.ACCESS_DENIED);
    }

    if (shareLink.revoked) {
        throw new Error(SHARE_LINK_MESSAGES.en.LINK_REVOKED);
    }

    const journal = await getJournalById(shareLink.journalId);
    if (!journal) {
        throw new Error("Journal not found");
    }

    let expires;
    if (typeof shareLink.expiresAt.toDate === "function") {
        expires = shareLink.expiresAt.toDate();
    } else {
        expires = new Date(shareLink.expiresAt);
    }

    if (expires < new Date()) {
        throw new Error(SHARE_LINK_MESSAGES.en.LINK_EXPIRED);
    }

    const data = {
        token,
        requesterId,
        userId: shareLink.userId,
        journalId: shareLink.journalId,
        status: ACCESS_STATUS.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    return await createAccessRequest(data);
};

export const approveAccessService = async (requestId) => {
    await updateAccessRequestStatus(requestId, ACCESS_STATUS.APPROVED);
};

export const denyAccessService = async (requestId) => {
    await updateAccessRequestStatus(requestId, ACCESS_STATUS.DENIED);
};

export const revokeShareLinkService = async (userId, token) => {
    const shareLink = await getShareLinkByToken(token);

    if (!shareLink) {
        throw new Error(SHARE_LINK_MESSAGES.en.LINK_NOT_FOUND);
    }

    if (shareLink.user_id !== userId) {
        throw new Error(SHARE_LINK_MESSAGES.en.ACCESS_DENIED);
    }

    await revokeShareLinkRepo(token);

    const accessRequests = await getAccessRequestsByToken(token); 
    for (const req of accessRequests) {
        await updateAccessRequestStatus(req.id, ACCESS_STATUS.DENIED);
    }

    return { success: true };
};