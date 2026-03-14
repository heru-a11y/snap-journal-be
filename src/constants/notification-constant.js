export const NOTIFICATION_COLLECTION = "notifications";

export const NOTIFICATION_FIELDS = {
    NOTIFIABLE_ID: "notifiable_id",
    CREATED_AT: "created_at",
    READ_AT: "read_at",
    UPDATED_AT: "updated_at",
    DATA: "data",
    TYPE: "type"
};

export const NOTIFICATION_QUERY = {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
    ORDER_DESC: "desc"
};

export const NOTIFICATION_MESSAGES = {
    id: {
        NOT_FOUND: "Notifikasi tidak ditemukan",
        MARKED_AS_READ: "Notifikasi ditandai sudah dibaca",
        ALL_DELETED: "Seluruh notifikasi berhasil dihapus",
        NONE_TO_DELETE: "Tidak ada notifikasi yang perlu dihapus",
        ID_DELETED: "Notifikasi berhasil dihapus",
        ERROR_PARSING: "Gagal memuat konten",
        DEFAULT_TITLE: "Notifikasi",
        DEFAULT_MESSAGE: "Tidak ada pesan"
    },
    en: {
        NOT_FOUND: "Notification not found",
        MARKED_AS_READ: "Notification marked as read",
        ALL_DELETED: "All notifications deleted successfully",
        NONE_TO_DELETE: "No notifications to delete",
        ID_DELETED: "Notification deleted successfully",
        ERROR_PARSING: "Failed to load content",
        DEFAULT_TITLE: "Notification",
        DEFAULT_MESSAGE: "No Message"
    }
};