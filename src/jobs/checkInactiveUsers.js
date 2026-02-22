import { database } from "../applications/database.js";
import admin from "firebase-admin"; 
import { v4 as uuidv4 } from "uuid";
import aiReminderService from "../services/ai/ai-reminder-service.js";
import { logger } from "../applications/logging.js";

export const checkInactiveUsers = async () => {
    logger.info("Starting Job: Inactive User Reminder");

    try {
        const usersRef = database.collection("users");
        const journalsRef = database.collection("journals");
        const notificationsRef = database.collection("notifications");
        
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - (48 * 60 * 60 * 1000));
        const cutoffISO = cutoffTime.toISOString();
        const cooldownTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        const snapshot = await usersRef
            .where("last_entry", "<", cutoffISO)
            .get();

        if (snapshot.empty) {
            logger.info("Job Finished: No inactive users found");
            return;
        }

        let batch = database.batch();
        let processedCount = 0;
        let batchCount = 0;

        for (const doc of snapshot.docs) {
            const user = doc.data();
            const userId = doc.id;

            if (!user.fcm_token) continue;

            if (user.last_reminder_at) {
                const lastReminded = new Date(user.last_reminder_at);
                if (lastReminded > cooldownTime) continue; 
            }

            const lastJournalSnap = await journalsRef
                .where("user_id", "==", userId)
                .orderBy("created_at", "desc")
                .limit(1)
                .get();

            let reminderTitle = "Waktunya Menulis Jurnal ✍️";
            let reminderBody = `Halo ${user.name || 'Teman'}, apa kabar hari ini? Yuk tulis jurnal lagi!`;

            if (!lastJournalSnap.empty) {
                const lastJournalData = lastJournalSnap.docs[0].data();

                try {
                    const aiResponse = await aiReminderService.generatePersonalizedReminder(lastJournalData, user.name);
                    if (aiResponse && aiResponse.title && aiResponse.body) {
                        reminderTitle = aiResponse.title;
                        reminderBody = aiResponse.body;
                    }
                } catch (e) {
                    logger.warn(`Failed to generate AI reminder for user ${userId}: ${e.message}`);
                }
            }

            const notificationId = uuidv4();

            try {
                await admin.messaging().send({
                    token: user.fcm_token,
                    notification: { 
                        title: reminderTitle, 
                        body: reminderBody 
                    },
                    data: { type: "reminder" }
                });
            } catch (fcmError) {
                logger.error(`FCM Error for user ${userId}: ${fcmError.message}`);
                if (fcmError.code === 'messaging/registration-token-not-registered' || 
                    fcmError.code === 'messaging/invalid-argument') {
                    batch.update(usersRef.doc(userId), { fcm_token: null });
                }
            }

            batch.set(notificationsRef.doc(notificationId), {
                id: notificationId,
                type: "reminder",
                notifiable_id: userId,
                data: JSON.stringify({ 
                    title: reminderTitle, 
                    message: reminderBody, 
                    type: "reminder" 
                }),
                read_at: null,
                created_at: new Date().toISOString()
            });

            batch.update(usersRef.doc(userId), { 
                last_reminder_at: new Date().toISOString()
            });

            processedCount++;
            batchCount += 2;

            if (batchCount >= 400) {
                await batch.commit();
                batch = database.batch();
                batchCount = 0;
            }
        }

        if (batchCount > 0) await batch.commit();

        logger.info(`Job Finished: Sent ${processedCount} personalized reminders`);

    } catch (error) {
        logger.error(`Job Error (Inactive Users): ${error.message}`);
    }
};