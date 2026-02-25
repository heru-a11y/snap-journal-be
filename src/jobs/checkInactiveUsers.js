import { database } from "../applications/database.js";
import admin from "firebase-admin"; 
import { v4 as uuidv4 } from "uuid";
import aiReminderService from "../services/ai/ai-reminder-service.js";
import userRepository from "../repositories/user-repository.js";
import { logger } from "../applications/logging.js";
import { USER_COLLECTION, USER_FIELDS } from "../constants/user-constant.js";
import { NOTIFICATION_COLLECTION, NOTIFICATION_FIELDS } from "../constants/notification-constant.js";
import { INACTIVE_USER_JOB } from "../constants/inactiveUserJob-constant.js";

export const checkInactiveUsers = async () => {
    logger.info("Starting Job: Inactive User Reminder");

    try {
        const now = new Date();
        const cutoffISO = new Date(now.getTime() - (INACTIVE_USER_JOB.CUTOFF_HOURS * 60 * 60 * 1000)).toISOString();
        const cooldownTime = new Date(now.getTime() - (INACTIVE_USER_JOB.COOLDOWN_HOURS * 60 * 60 * 1000));
        const dateKey = now.toISOString().split('T')[0];

        let batch = database.batch();
        let processedCount = 0;
        let batchCount = 0;
        
        const CONCURRENCY_LIMIT = 20;
        const QUERY_LIMIT = 500;
        
        let lastDoc = null;
        let hasMore = true;

        while (hasMore) {
            const snapshot = await userRepository.findInactiveUsers(cutoffISO, QUERY_LIMIT, lastDoc);

            if (snapshot.empty) {
                hasMore = false;
                break;
            }

            lastDoc = snapshot.docs[snapshot.docs.length - 1];
            const docs = snapshot.docs;

            for (let i = 0; i < docs.length; i += CONCURRENCY_LIMIT) {
                const chunk = docs.slice(i, i + CONCURRENCY_LIMIT);

                const chunkResults = await Promise.all(chunk.map(async (doc) => {
                    const user = doc.data();
                    const userId = doc.id;

                    if (!user[USER_FIELDS.FCM_TOKEN]) return null;
                    if (user[USER_FIELDS.LAST_REMINDER_AT] && new Date(user[USER_FIELDS.LAST_REMINDER_AT]) > cooldownTime) return null;

                    const userLang = user.language || 'id';
                    const messages = INACTIVE_USER_JOB.MESSAGES[userLang] || INACTIVE_USER_JOB.MESSAGES.id;

                    let reminderTitle = messages.TITLE;
                    let reminderBody = messages.BODY(user[USER_FIELDS.NAME]);
                    const hasLastJournalData = user[USER_FIELDS.LAST_JOURNAL_SUMMARY] || user[USER_FIELDS.LAST_JOURNAL_EMOTION];

                    if (hasLastJournalData) {
                        try {
                            const journalData = {
                                summary: user[USER_FIELDS.LAST_JOURNAL_SUMMARY],
                                emotion: user[USER_FIELDS.LAST_JOURNAL_EMOTION]
                            };
                            
                            const aiPromise = aiReminderService.generatePersonalizedReminder(journalData, user[USER_FIELDS.NAME], userLang);
                            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Request Timeout")), 5000));
                            
                            const aiResponse = await Promise.race([aiPromise, timeoutPromise]);
                            
                            if (aiResponse?.title && aiResponse?.body) {
                                reminderTitle = aiResponse.title;
                                reminderBody = aiResponse.body;
                            }
                        } catch (e) {
                            logger.warn(`Failed AI reminder for ${userId}: ${e.message}`);
                        }
                    }

                    let fcmFailedCode = null;
                    let isRetryableError = false;
                    let fcmErrorMessage = null;

                    try {
                        if (user[USER_FIELDS.FCM_TOKEN] === "dummy") {
                            logger.info(`Mocking FCM send for user: ${userId}`);
                        } else {
                            await admin.messaging().send({
                                token: user[USER_FIELDS.FCM_TOKEN],
                                notification: { title: reminderTitle, body: reminderBody },
                                data: { type: "reminder" }
                            });
                        }
                    } catch (fcmError) {
                        logger.error(`FCM Error for ${userId}: ${fcmError.message}`);
                        if (INACTIVE_USER_JOB.FCM_ERROR_RECORDS.includes(fcmError.code)) {
                            fcmFailedCode = fcmError.code;
                        } else {
                            isRetryableError = true;
                            fcmErrorMessage = fcmError.message;
                        }
                    }

                    return {
                        userId,
                        reminderTitle,
                        reminderBody,
                        fcmFailedCode,
                        isRetryableError,
                        fcmErrorMessage
                    };
                }));

                for (const result of chunkResults) {
                    if (!result) continue;

                    if (result.fcmFailedCode) {
                        batch.update(database.collection(USER_COLLECTION).doc(result.userId), { 
                            [USER_FIELDS.FCM_TOKEN]: null 
                        });
                        batchCount += 1;
                    } else if (result.isRetryableError) {
                        const dlqId = uuidv4();
                        const dlqRef = database.collection("dead_letter_queue").doc(dlqId);
                        batch.set(dlqRef, {
                            user_id: result.userId,
                            title: result.reminderTitle,
                            body: result.reminderBody,
                            error: result.fcmErrorMessage,
                            created_at: new Date().toISOString()
                        });
                        batchCount += 1;
                    } else {
                        const notificationId = `reminder_${result.userId}_${dateKey}`;
                        const notifRef = database.collection(USER_COLLECTION).doc(result.userId).collection(NOTIFICATION_COLLECTION).doc(notificationId);
                        
                        batch.set(notifRef, {
                            [NOTIFICATION_FIELDS.ID]: notificationId,
                            type: "reminder",
                            data: { 
                                title: result.reminderTitle, 
                                message: result.reminderBody, 
                                type: "reminder" 
                            },
                            [NOTIFICATION_FIELDS.READ_AT]: null,
                            [NOTIFICATION_FIELDS.CREATED_AT]: new Date().toISOString()
                        }, { merge: true });

                        batch.update(database.collection(USER_COLLECTION).doc(result.userId), { 
                            [USER_FIELDS.LAST_REMINDER_AT]: new Date().toISOString()
                        });

                        processedCount++;
                        batchCount += 2;
                    }

                    if (batchCount >= INACTIVE_USER_JOB.BATCH_THRESHOLD) {
                        await batch.commit();
                        batch = database.batch();
                        batchCount = 0;
                    }
                }
            }
        }

        if (batchCount > 0) await batch.commit();
        logger.info(`Job Finished: Sent ${processedCount} reminders`);

    } catch (error) {
        logger.error(`Job Error: ${error.message}`);
    }
};