/**
 * @swagger
 * tags:
 *   - name: Feelings
 *     description: API untuk User Feeling Daily Question (Mood Tracker)
 */

/**
 * @swagger
 * /api/v1/feelings:
 *   post:
 *     summary: Simpan atau update feeling hari ini pilih Happy, Calm, Sad, Tired, Angry
 *     description: Endpoint ini bersifat "Upsert". Jika user belum memilih hari ini, akan membuat baru. Jika sudah memilih, akan mengupdate pilihan sebelumnya (misal dari Angry jadi Happy).
 *     tags:
 *       - Feelings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         description: Preferensi bahasa respons API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mood
 *             properties:
 *               mood:
 *                 type: string
 *                 enum: [Happy, Calm, Sad, Tired, Angry]
 *                 example: "Happy"
 *                 description: |
 *                   Nilai mood yang diperbolehkan hanya:
 *                   - Happy
 *                   - Calm
 *                   - Sad
 *                   - Tired
 *                   - Angry
 *                   Input bersifat Case Sensitive dan harus sama persis dengan daftar di atas.
 *     responses:
 *       200:
 *         description: Feeling berhasil disimpan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       example: "2026-02-13"
 *                     mood:
 *                       type: string
 *                       example: "Happy"
 *                 message:
 *                   type: string
 *                   example: "Feeling hari ini berhasil disimpan."
 *       400:
 *         description: Validasi gagal (Mood tidak valid atau wajib diisi)
 *       401:
 *         description: Unauthorized (Token tidak valid)
 */

/**
 * @swagger
 * /api/v1/feelings/today:
 *   get:
 *     summary: Cek apakah user sudah mengisi feeling hari ini
 *     description: Digunakan saat Home Page dimuat. Jika data null, tampilkan UI pemilihan feeling.
 *     tags:
 *       - Feelings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         description: Preferensi bahasa respons API
 *     responses:
 *       200:
 *         description: Berhasil mengambil data status feeling hari ini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: Object feeling jika sudah mengisi, null jika belum
 *                   properties:
 *                     mood:
 *                       type: string
 *                       example: "Happy"
 *                     date:
 *                       type: string
 *                       example: "2026-02-13"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/feelings/history:
 *   get:
 *     summary: Mendapatkan riwayat feeling user (30 hari terakhir)
 *     tags:
 *       - Feelings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         description: Preferensi bahasa respons API
 *     responses:
 *       200:
 *         description: List riwayat feeling berhasil diambil
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
 *                       mood:
 *                         type: string
 *                         example: "Sad"
 *                       date:
 *                         type: string
 *                         example: "2026-02-12"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
