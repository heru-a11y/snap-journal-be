export const INACTIVE_USER_JOB = {
    CUTOFF_HOURS: 24,
    COOLDOWN_HOURS: 24,
    BATCH_THRESHOLD: 400,
    MESSAGES: {
        id: {
            TITLE: "Waktunya Menulis Jurnal",
            BODY: (name) => `Halo ${name || 'Teman'}, apa kabar hari ini? Yuk tulis jurnal lagi!`
        },
        en: {
            TITLE: "Time to Journal",
            BODY: (name) => `Hello ${name || 'Friend'}, how are you today? Let's write a journal!`
        }
    },
    FCM_ERROR_RECORDS: [
        'messaging/registration-token-not-registered',
        'messaging/invalid-argument'
    ]
};