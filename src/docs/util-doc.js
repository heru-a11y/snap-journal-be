/**
 * @swagger
 * /api/v1/uploads/editor:
 *   post:
 *     summary: Upload gambar untuk Rich Text Editor
 *     tags:
 *       - Utilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Berhasil, mengembalikan URL
 */

/**
 * @swagger
 * /api/v1/uploads/file:
 *   delete:
 *     summary: Hapus file gambar editor (Cleanup)
 *     tags:
 *       - Utilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: File berhasil dihapus dari GCS
 */
