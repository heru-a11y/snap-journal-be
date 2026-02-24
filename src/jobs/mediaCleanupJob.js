import { MEDIA_CLEANUP_CONFIG } from '../constants/mediaCleanupJob-constant.js';
import { logger } from '../applications/logging.js';
import admin from 'firebase-admin';

const db = admin.firestore();

export const cleanupOrphanedImages = async () => {
    const bucketName = process.env.GOOGLE_BUCKET_NAME;

    if (!bucketName) {
        logger.error('[Media Cleanup Job] GOOGLE_BUCKET_NAME is not defined in environment variables');
        return;
    }

    try {
        const bucket = admin.storage().bucket(bucketName);
        logger.info('[Media Cleanup Job] Starting orphaned images cleanup...');
        
        const [files] = await bucket.getFiles({ prefix: MEDIA_CLEANUP_CONFIG.STORAGE_PATH_PREFIX });
        const now = new Date();
        let deletedCount = 0;

        for (const file of files) {
            if (!file.name.includes(MEDIA_CLEANUP_CONFIG.STORAGE_PATH_SUFFIX)) continue;

            const [metadata] = await file.getMetadata();
            const createdAt = new Date(metadata.timeCreated);
            const ageInHours = (now - createdAt) / (1000 * 60 * 60);

            if (ageInHours > MEDIA_CLEANUP_CONFIG.RETENTION_HOURS) {
                const fileUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`;

                const mediaSnapshot = await db.collection('journal_media')
                    .where('url', '==', fileUrl)
                    .limit(1)
                    .get();

                if (mediaSnapshot.empty) {
                    await file.delete();
                    deletedCount++;
                    logger.debug(`[Media Cleanup Job] File deleted: ${file.name}`);
                }
            }
        }

        logger.info(`[Media Cleanup Job] Finished. Total files deleted: ${deletedCount}`);
    } catch (error) {
        logger.error(`[Media Cleanup Job] Error execution failed: ${error.message}`);
    }
};

export default cleanupOrphanedImages;