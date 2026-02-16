/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Manajemen Sesi Pengguna (Logout)
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Logout berhasil"
 *       401:
 *         description: Unauthorized (token tidak valid atau tidak ada)
 */
