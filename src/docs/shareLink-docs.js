/**
 * @swagger
 * tags:
 *   - name: Share Link
 *     description: Manajemen fitur share link.
 */

/**
 * @swagger
 * /api/v1/share-links:
 *   post:
 *     summary: Membuat link untuk share journal.
 *     tags:
 *       - Share Link
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - journalId
 *               - shareType
 *             properties:
 *               journalId:
 *                 type: string
 *               shareType:
 *                 type: string
 *                 enum: [public, restricted]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Optional, max 30 days from now
 *     responses:
 *       200:
 *         description: "Link created, response contains { data: { token, expiresAt } }"
 */

/**
 * @swagger
 * /api/v1/share-links/{token}/revoke:
 *   patch:
 *     summary: Menghapus akses link share journal.
 *     tags:
 *       - Share Link
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Share link token
 *     responses:
 *       200:
 *         description: "Link revoked, response contains { data: { success: true } }"
 */

/**
 * @swagger
 * /api/v1/l/{token}:
 *   get:
 *     summary: Mengakses journal berdasarkan token link share journal.
 *     tags:
 *       - Share Link
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Share link token
 *     responses:
 *       200:
 *         description: "Access result, response contains { data: { access, journalId?, reason? } }"
 */

/**
 * @swagger
 * /api/v1/l/{token}/request:
 *   post:
 *     summary: Meminta akses untuk mengakses journal yang link sharenya bersifat private.
 *     tags:
 *       - Share Link
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Share link token
 *     requestBody:
 *       description: No body needed, token in path and user from auth
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: "Access request created, response contains { data: { token, requesterId, status, createdAt, ... } }"
 */

/**
 * @swagger
 * /api/v1/access-requests/{requestId}/approve:
 *   patch:
 *     summary: Setujui permintaan akses journal.
 *     tags:
 *       - Share Link
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "Request approved, response contains { data: { success: true, status: 'approved' } }"
 */

/**
 * @swagger
 * /api/v1/access-requests/{requestId}/deny:
 *   patch:
 *     summary: Tolak permintaan akses journal.
 *     tags:
 *       - Share Link
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "Request denied, response contains { data: { success: true, status: 'denied' } }"
 */