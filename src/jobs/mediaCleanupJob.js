import { MEDIA_CLEANUP_CONFIG } from '../constants/mediaCleanupJob-constant.js';
import { logger } from '../applications/logging.js';
import { db, bucket } from '../applications/firebase.js';

export const cleanupOrphanedImages = async () => {
    try {
        logger.info(`[Media Cleanup Job] Memulai pengecekan di bucket: ${bucket.name}`);
        const [files] = await bucket.getFiles({ prefix: MEDIA_CLEANUP_CONFIG.STORAGE_PATH_PREFIX });
        logger.info(`[Media Cleanup Job] Ditemukan ${files.length} file di path prefix. Memproses analisis...`);
        
        const now = new Date();
        let deletedCount = 0;

        for (const file of files) {
            try {
                if (file.name.endsWith('/')) continue;
                if (!file.name.includes(MEDIA_CLEANUP_CONFIG.STORAGE_PATH_SUFFIX)) continue;

                const timeCreatedStr = file.metadata?.timeCreated;
                if (!timeCreatedStr) continue; 

                const createdAt = new Date(timeCreatedStr);
                const ageInHours = (now - createdAt) / (1000 * 60 * 60);

                if (ageInHours > MEDIA_CLEANUP_CONFIG.RETENTION_HOURS) {
                    const bucketName = bucket.name.trim();
                    const gcsUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`;
                    const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(file.name)}?alt=media`;

                    const [mediaSnapshotGcs, mediaSnapshotFirebase] = await Promise.all([
                        db.collection('journal_media').where('url', '==', gcsUrl).limit(1).get(),
                        db.collection('journal_media').where('url', '==', firebaseUrl).limit(1).get()
                    ]);

                    if (mediaSnapshotGcs.empty && mediaSnapshotFirebase.empty) {
                        await bucket.file(file.name).delete({ ignoreNotFound: true });
                        deletedCount++;
                        logger.info(`[Media Cleanup Job] File yatim berhasil dihapus: ${file.name}`);
                    }
                }
            } catch (fileError) {
                if (fileError.code === 5 || fileError.message?.includes('NOT_FOUND')) {
                    logger.info(`[Media Cleanup Job] File dilewati (sudah terhapus dari GCS): ${file.name}`);
                } else {
                    logger.warn(`[Media Cleanup Job] Gagal memproses ${file.name}: ${fileError.message}`);
                }
            }
        }

        logger.info(`[Media Cleanup Job] Selesai. Total file yang berhasil dihapus: ${deletedCount}`);
    } catch (error) {
        logger.error(`[Media Cleanup Job] Error Utama: ${error.message}`);
    }
};

export default cleanupOrphanedImages;