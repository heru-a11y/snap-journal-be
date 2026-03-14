export const SHARE_LINK_COLLECTION = "share_links";
export const ACCESS_REQUEST_COLLECTION = "access_requests";

export const SHARE_LINK_FIELDS = {
    USER_ID: "userId",
    JOURNAL_ID: "journalId",
    SHARE_TYPE: "shareType",
    CREATED_AT: "createdAt",
    EXPIRES_AT: "expiresAt",
    REVOKED: "revoked"
};

export const ACCESS_REQUEST_FIELDS = {
    TOKEN: "token",
    JOURNAL_ID: "journalId",
    REQUESTER_ID: "requesterId",
    USER_ID: "userId",
    STATUS: "status",
    CREATED_AT: "createdAt",
    UPDATED_AT: "updatedAt"
};

export const SHARE_TYPE = {
    PUBLIC: "public",
    RESTRICTED: "restricted"
};

export const ACCESS_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    DENIED: "denied"
};

export const SHARE_LINK_DEFAULTS = {
    EXPIRE_DAYS: 7,
     MAX_EXPIRE_DAYS: 30
};

export const SHARE_LINK_MESSAGES = {
    id: {
        LINK_NOT_FOUND: "Link tidak ditemukan.",
        LINK_EXPIRED: "Link akses sudah kadaluarsa.",
        LINK_REVOKED: "Link akses sudah dicabut.",
        ACCESS_REQUIRED: "Anda harus login untuk mengakses link ini.",
        REQUEST_SENT: "Permintaan akses telah dikirim.",
        ACCESS_PENDING: "Permintaan akses sedang menunggu persetujuan.",
        ACCESS_DENIED: "Permintaan akses ditolak.",
        LINK_CREATED: "Link berhasil dibuat.",
        LINK_REVOKED_SUCCESS: "Link berhasil dicabut."
    },
    en: {
        LINK_NOT_FOUND: "Link not found.",
        LINK_EXPIRED: "Access link has expired.",
        LINK_REVOKED: "Access link has been revoked.",
        ACCESS_REQUIRED: "You must log in to access this link.",
        REQUEST_SENT: "Access request has been sent.",
        ACCESS_PENDING: "Access request is pending approval.",
        ACCESS_DENIED: "Access request denied.",
        LINK_CREATED: "Link created successfully.",
        LINK_REVOKED_SUCCESS: "Link revoked successfully."
    }
};