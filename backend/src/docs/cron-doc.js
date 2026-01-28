/**
 * @swagger
 * tags:
 *   - name: Cron Job (Testing)
 *     description: Endpoint khusus untuk memicu background jobs secara manual (Testing Purpose)
 */

/**
 * @swagger
 * /api/test-cron:
 *   post:
 *     summary: Memicu job "Inactive User Reminder" secara manual
 *     description: |
 *       Menjalankan logika pengecekan user yang tidak menulis jurnal lebih dari 48 jam.
 *       Jika user memenuhi syarat (punya FCM token & belum diingatkan 24 jam terakhir), sistem akan:
 *       1. Mengirim Notifikasi FCM ke HP user.
 *       2. Membuat data notifikasi di database.
 *       3. Mengupdate waktu `last_reminder_at` user.
 *     tags:
 *       - Cron Job (Testing)
 *     responses:
 *       200:
 *         description: Job berhasil dieksekusi (Cek console server untuk detail log)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Cron Job Triggered Successfully"
 *       500:
 *         description: Terjadi kesalahan server saat menjalankan job
 */