/**
 * @swagger
 * tags:
 *   - name: Notification
 *     description: Manajemen Notifikasi User (Riwayat dan Status Baca)
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Mengambil daftar notifikasi user
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         description: Preferensi bahasa respons
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Batas jumlah notifikasi yang diambil (Default 50)
 *     responses:
 *       200:
 *         description: Daftar notifikasi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID Notifikasi
 *                       title:
 *                         type: string
 *                         example: "Pengingat Harian"
 *                       message:
 *                         type: string
 *                         example: "Jangan lupa mengisi jurnal hari ini!"
 *                       read_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         description: Tanggal dibaca (Null jika belum dibaca)
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Tanggal notifikasi dibuat
 */

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Menandai notifikasi spesifik sebagai sudah dibaca
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         description: Preferensi bahasa respons
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Notifikasi yang ingin ditandai
 *     responses:
 *       200:
 *         description: Berhasil menandai notifikasi sebagai sudah dibaca
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     read_at:
 *                       type: string
 *                     message:
 *                       type: string
 *       404:
 *         description: Notifikasi tidak ditemukan atau bukan milik user
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   delete:
 *     summary: Menghapus seluruh riwayat notifikasi user
 *     description: Menghapus semua notifikasi milik user menggunakan batch delete untuk efisiensi.
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         description: Preferensi bahasa respons
 *     responses:
 *       200:
 *         description: Seluruh notifikasi berhasil dihapus
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
 *                       example: Seluruh notifikasi berhasil dihapus
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Menghapus satu notifikasi spesifik milik user
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         description: Preferensi bahasa respons
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID notifikasi yang ingin dihapus
 *     responses:
 *       200:
 *         description: Notifikasi berhasil dihapus
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
 *                       example: Notifikasi berhasil dihapus
 *       404:
 *         description: Notifikasi tidak ditemukan atau bukan milik user
 *       401:
 *         description: Unauthorized
 */