/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Registrasi, Login, Verifikasi Email, dan Reset Password
 */


/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Mengambil data user yang sedang login
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                       example: "uid_firebase_123"
 *                     name:
 *                       type: string
 *                       example: "Name User"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     last_entry_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized (token tidak valid atau tidak ada)
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   delete:
 *     summary: Logout user (revoke semua refresh token)
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout berhasil"
 *       401:
 *         description: Unauthorized (token tidak valid atau tidak ada)
 */

/**
 * @swagger
 * /api/v1/auth/email/verify-notification:
 *   post:
 *     summary: Mengirim ulang email verifikasi
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email verifikasi berhasil dikirim ulang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Link verifikasi telah dikirim ulang ke email Anda."
 *                 status:
 *                   type: string
 *                   example: "verification-link-sent"
 *       400:
 *         description: Email sudah terverifikasi
 *       401:
 *         description: Unauthorized (token tidak valid atau tidak ada)
 *       404:
 *         description: User tidak ditemukan
 *       429:
 *         description: Terlalu banyak permintaan (rate limit)
 */