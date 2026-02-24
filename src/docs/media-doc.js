/**
 * @swagger
 * tags:
 *   - name: Media
 *     description: Manajemen media independen untuk jurnal.
 */

/**
 * @swagger
 * /api/v1/media/editor-image:
 *   post:
 *     summary: Mengunggah gambar dari Rich Text Editor
 *     description: Mengunggah gambar secara langsung saat disisipkan ke dalam editor. Mengembalikan URL gambar dari GCS.
 *     tags:
 *       - Media
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
 *                 description: File gambar yang disisipkan melalui editor.
 *     responses:
 *       200:
 *         description: Berhasil mengunggah gambar.
 *       400:
 *         description: Validasi gagal.
 */

/**
 * @swagger
 * /api/v1/media/editor-image:
 *   delete:
 *     summary: Menghapus gambar dari Rich Text Editor
 *     description: Menghapus gambar dari GCS ketika dihapus dari editor.
 *     tags:
 *       - Media
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file_url
 *             properties:
 *               file_url:
 *                 type: string
 *                 description: URL gambar GCS yang akan dihapus.
 *     responses:
 *       200:
 *         description: Berhasil menghapus gambar.
 *       400:
 *         description: Validasi gagal.
 */