export const JOURNAL_COLLECTION = "journals";

export const JOURNAL_FIELDS = {
    USER_ID: "user_id",
    CREATED_AT: "created_at"
};

export const JOURNAL_MESSAGES = {
    id: {
        NOT_FOUND: "Jurnal tidak ditemukan",
        FORBIDDEN: "Akses ditolak",
        TITLE_REQUIRED: "Judul jurnal wajib diisi dengan benar.",
        VIDEO_REQUIRED: "File video wajib diupload untuk publikasi.",
        NO_DATA_PERIOD: "Tidak ada data jurnal pada periode ini.",
        AI_BUSY: "Layanan AI sedang sibuk, coba lagi nanti.",
        DRAFT_SAVED: "Jurnal disimpan ke draft",
        PUBLISHED: "Jurnal berhasil dipublikasikan",
        DELETED: "Jurnal dan seluruh file media berhasil dihapus",
        NO_INSIGHT: "Belum ada jurnal untuk dianalisis."
    },
    en: {
        NOT_FOUND: "Journal not found",
        FORBIDDEN: "Access denied",
        TITLE_REQUIRED: "Journal title is required.",
        VIDEO_REQUIRED: "Video file is required for publication.",
        NO_DATA_PERIOD: "No journal data found for this period.",
        AI_BUSY: "AI service is busy, please try again later.",
        DRAFT_SAVED: "Journal saved to draft",
        PUBLISHED: "Journal published successfully",
        DELETED: "Journal and all media files deleted successfully",
        NO_INSIGHT: "No journals available for analysis."
    }
};

export const JOURNAL_DEFAULTS = {
    id: {
        DRAFT_TITLE: "Draft Tanpa Judul",
        INSIGHT: "Belum ada insight."
    },
    en: {
        DRAFT_TITLE: "Untitled Draft",
        INSIGHT: "No insight yet."
    },
    EXPRESSION: "😐"
};

export const JOURNAL_CATEGORIES = {
    FAVORITES: "favorites",
    DRAFT: "draft",
    ALL: "all"
};

export const SORT_ORDER = {
    DESC: "desc",
    ASC: "asc"
};