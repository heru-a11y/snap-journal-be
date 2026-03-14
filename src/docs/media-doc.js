/**
 * @swagger
 * tags:
 *   - name: Media
 *     description: Manajemen media independen untuk jurnal (Upload/Hapus secara asinkron sebelum disubmit ke jurnal).
 */

/**
 * @swagger
 * /api/v1/media/editor-image:
 *   post:
 *     summary: Mengunggah gambar jurnal
 *     description: Mengunggah gambar untuk ditautkan ke jurnal. Mengembalikan URL gambar dari GCS. URL ini nantinya disertakan dalam array `images` (Maksimal 3 per jurnal) saat menyimpan jurnal.
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
 *                 description: File gambar jurnal.
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
 *     summary: Menghapus gambar jurnal
 *     description: Menghapus gambar dari GCS jika pengguna membatalkan (unattach) gambar tersebut sebelum jurnal disimpan.
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
 *         description: Validasi gagal atau URL tidak ditemukan.
 */