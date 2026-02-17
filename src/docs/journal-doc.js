/**
 * @swagger
 * tags:
 *   - name: Journal
 *     description: Manajemen Jurnal Harian (CRUD, Upload Media, AI Analysis, & Chat)
 */

/**
 * @swagger
 * /api/v1/journals:
 *   post:
 *     summary: Membuat jurnal baru
 *     description: Upload video (attachment) dan teks rich-text (HTML). Foto inline diatur via endpoint upload terpisah.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               note:
 *                 type: string
 *                 description: "HTML String dari editor (berisi tag <img src='...'>)"
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: "Video attachment utama (opsional)"
 *     responses:
 *       201:
 *         description: Berhasil
 */

/**
 * @swagger
 * /api/v1/journals:
 *   get:
 *     summary: Mengambil daftar jurnal
 *     description: |
 *       Mengambil daftar jurnal user dengan prioritas filter:
 *       1. Rentang Tanggal (start_date & end_date)
 *       2. Tanggal Spesifik (date)
 *       3. Bulan & Tahun (month & year) - Default
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter bulan (1–12). Digunakan jika date/range kosong.
 *         example: 2
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter tahun. Digunakan jika date/range kosong.
 *         example: 2026
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal spesifik (YYYY-MM-DD).
 *         example: "2026-02-14"
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal awal rentang (YYYY-MM-DD).
 *         example: "2026-02-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir rentang (YYYY-MM-DD).
 *         example: "2026-02-07"
 *     responses:
 *       200:
 *         description: List jurnal berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     filter_type:
 *                       type: string
 *                       example: "monthly"
 *                       description: "Jenis filter yang digunakan: 'monthly', 'date', atau 'range'"
 *                     filter_start:
 *                       type: string
 *                       format: date-time
 *                       description: "Waktu mulai periode filter (ISO 8601)"
 *                     filter_end:
 *                       type: string
 *                       format: date-time
 *                       description: "Waktu akhir periode filter (ISO 8601)"
 *                     total_data:
 *                       type: integer
 *                       example: 10
 *                       description: "Jumlah data yang ditemukan"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "journal_id_123"
 *                       title:
 *                         type: string
 *                         example: "Judul Jurnal"
 *                       note:
 *                         type: string
 *                         example: "Isi catatan hari ini..."
 *                       emotion:
 *                         type: string
 *                         nullable: true
 *                         example: "Happy"
 *                       video_url:
 *                         type: string
 *                         nullable: true
 *                       photo_url:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Validasi query gagal (Format tanggal salah)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Gagal mengambil data jurnal
 */

/**
 * @swagger
 * /api/v1/journals/latest:
 *   get:
 *     summary: Mengambil jurnal terakhir (Daily Insight)
 *     description: |
 *       Mengambil satu dokumen jurnal yang paling baru dibuat oleh user. 
 *       Endpoint ini digunakan untuk menampilkan "Daily Insight" (Highlight, Strategy, Suggestion) pada dashboard.
 *       Jika user belum pernah membuat jurnal, data akan bernilai null.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil jurnal terakhir
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: Objek jurnal terakhir atau null jika tidak ada data.
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     title:
 *                       type: string
 *                       example: "Hari yang melelahkan"
 *                     note:
 *                       type: string
 *                       example: "<p>Hari ini cukup berat...</p>"
 *                     emotion:
 *                       type: string
 *                       example: "Sad"
 *                     chatbot_highlight:
 *                       type: string
 *                       description: Ringkasan kondisi mental user dari AI
 *                       example: "Anda merasa sangat lelah secara mental dan fisik."
 *                     chatbot_strategy:
 *                       type: string
 *                       description: Saran tindakan konkret dari AI
 *                       example: "Luangkan 5-10 menit untuk praktik pernapasan."
 *                     chatbot_suggestion:
 *                       type: string
 *                       description: Kalimat validasi emosi dari AI
 *                       example: "Sangat wajar untuk merasa lelah, istirahatlah sejenak."
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized (Token tidak valid atau tidak ada)
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/v1/journals/daily-insight:
 *   get:
 *     summary: Mengambil Daily Insight (Emoji & Highlight)
 *     description: |
 *       Mengambil ringkasan insight dari jurnal terakhir user.
 *       Jika user baru saja menulis jurnal dan analisis belum selesai, endpoint ini
 *       akan otomatis memicu AI untuk membuatkan insight saat itu juga.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil insight
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     journal_id:
 *                       type: string
 *                       example: "b2773b03-70a7-426f-9f53-8ae41118f56d"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     expression:
 *                       type: string
 *                       description: Emoji yang menggambarkan perasaan user
 *                       example: "😌"
 *                     highlight:
 *                       type: string
 *                       description: Ringkasan kondisi mental user dari AI
 *                       example: "Anda merasa sangat lelah secara mental dan fisik karena tekanan pekerjaan."
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/v1/journals/{id}:
 *   get:
 *     summary: Mengambil detail satu jurnal
 *     description: Mengambil detail lengkap jurnal milik user, termasuk hasil analisis AI jika tersedia
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID jurnal (UUID)
 *     responses:
 *       200:
 *         description: Detail jurnal ditemukan
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
 *                     user_id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     note:
 *                       type: string
 *                     video_url:
 *                       type: string
 *                       nullable: true
 *                     photo_url:
 *                       type: string
 *                       nullable: true
 *                     image_path:
 *                       type: string
 *                       nullable: true
 *                     emotion:
 *                       type: string
 *                       nullable: true
 *                     expression:
 *                       type: string
 *                       nullable: true
 *                     confidence:
 *                       type: number
 *                       nullable: true
 *                     similarity:
 *                       type: number
 *                       nullable: true
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       nullable: true
 *                     chatbot_suggestion:
 *                       type: string
 *                       nullable: true
 *                     chatbot_highlight:
 *                       type: string
 *                       nullable: true
 *                     chatbot_strategy:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: Tidak memiliki akses ke jurnal ini
 *       404:
 *         description: Jurnal tidak ditemukan
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/journals/{id}:
 *   put:
 *     summary: Mengupdate jurnal
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID jurnal yang akan diupdate
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               note:
 *                 type: string
 *                 description: "HTML String baru"
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: "Video attachment baru (opsional)"
 *     responses:
 *       200:
 *         description: Berhasil
 */

/**
 * @swagger
 * /api/v1/journals/{id}:
 *   delete:
 *     summary: Menghapus jurnal
 *     description: Menghapus jurnal beserta file video dan/atau foto yang tersimpan di storage.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID jurnal (UUID)
 *     responses:
 *       200:
 *         description: Jurnal berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Jurnal dan file terkait berhasil dihapus"
 *       403:
 *         description: Tidak memiliki akses untuk menghapus jurnal
 *       404:
 *         description: Jurnal tidak ditemukan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Gagal menghapus file atau error internal
 */

/**
 * @swagger
 * /api/v1/journals/enhance:
 *   post:
 *     summary: Meminta AI memperbaiki atau mengembangkan teks jurnal
 *     description: AI dapat memperbaiki grammar, melakukan parafrase, atau mengembangkan teks jurnal.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "aku cape banget hari ini kerjaan numpuk"
 *               instruction:
 *                 type: string
 *                 enum: [fix_grammar, paraphrase, elaboration]
 *                 description: Jenis instruksi AI (opsional)
 *     responses:
 *       200:
 *         description: Teks berhasil diproses oleh AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 original_text:
 *                   type: string
 *                 enhanced_text:
 *                   type: string
 *                 instruction:
 *                   type: string
 *       400:
 *         description: Field text tidak diisi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Layanan AI tidak tersedia atau gagal memproses permintaan
 */

/**
 * @swagger
 * /api/v1/journals/{id}/chat:
 *   post:
 *     summary: Chat AI dengan konteks jurnal
 *     description: AI berperan sebagai asisten empatik/psikolog berdasarkan isi jurnal user.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID jurnal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Kenapa aku merasa sedih banget di tulisan ini?"
 *     responses:
 *       200:
 *         description: Balasan AI berdasarkan konteks jurnal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 journal_id:
 *                   type: string
 *                 question:
 *                   type: string
 *                 reply:
 *                   type: string
 *       400:
 *         description: Pesan pertanyaan tidak diisi
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Jurnal tidak ditemukan atau bukan milik user
 *       500:
 *         description: Layanan AI gagal memproses permintaan
 */

/**
 * @swagger
 * /api/v1/journals/{id}/analyze:
 *   post:
 *     summary: Memicu analisis mendalam (Deep Insight)
 *     description: Menghasilkan Tags, Suggestion, Strategy, dan Highlight dari AI, lalu menyimpannya ke database.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analisis berhasil, data jurnal diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     chatbot_strategy:
 *                       type: string
 *                     chatbot_suggestion:
 *                       type: string
 */

/**
 * @swagger
 * /api/v1/journals/mood-calendar:
 *   get:
 *     summary: Mengambil data kalender mood
 *     description: Digunakan untuk visualisasi kalender emosi bulanan di Frontend.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Bulan (1-12). Default bulan saat ini.
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *         description: Tahun. Default tahun saat ini.
 *     responses:
 *       200:
 *         description: Data mood per tanggal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                 month:
 *                   type: integer
 *                 moods:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       emotion:
 *                         type: string
 *                       expression:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */