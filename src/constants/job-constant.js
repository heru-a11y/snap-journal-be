export const INACTIVE_USER_JOB = {
    CUTOFF_HOURS: 24,
    COOLDOWN_HOURS: 24,
    BATCH_THRESHOLD: 400,
    DEFAULT_TITLE: "Waktunya Menulis Jurnal",
    DEFAULT_BODY: (name) => `Halo ${name || 'Teman'}, apa kabar hari ini? Yuk tulis jurnal lagi!`,
    FCM_ERROR_RECORDS: [
        'messaging/registration-token-not-registered',
        'messaging/invalid-argument'
    ]
};