/**
 * @swagger
 * tags:
 *   - name: Journal
 *     description: Manajemen Jurnal Harian, Upload Media, Analisis AI (Visual & Teks), serta Chatbot.
 */

/**
 * @swagger
 * /api/v1/journals:
 *   post:
 *     summary: Membuat jurnal baru (Publish)
 *     description: |
 *       Membuat jurnal baru dengan status **Published**.
 *       - `note` menerima teks murni (string).
 *       - `images` menerima array berisi string URL gambar (Maksimal 3 foto).
 *       - `video` menerima 1 file video.
 *     tags:
 *       - Journal
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - video
 *             properties:
 *               title:
 *                 type: string
 *               note:
 *                 type: string
 *               images:
 *                 type: array
 *                 maxItems: 3
 *                 items:
 *                   type: string
 *                 description: Daftar URL gambar yang disertakan dalam jurnal (Maksimal 3).
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: File video jurnal (Maksimal 1).
 *     responses:
 *       201:
 *         description: Berhasil membuat jurnal.
 *       400:
 *         description: Validasi gagal.
 */

/**
 * @swagger
 * /api/v1/journals/draft:
 *   post:
 *     summary: Menyimpan jurnal sebagai Draft
 *     description: |
 *       Menyimpan jurnal dengan status **Draft**.
 *       - `note` menerima teks murni (string).
 *       - `images` menerima array berisi string URL gambar (Maksimal 3 foto).
 *       - `video` menerima maksimal 1 file video (opsional untuk draf).
 *     tags:
 *       - Journal
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
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 default: "Untitled Draft"
 *               note:
 *                 type: string
 *               images:
 *                 type: array
 *                 maxItems: 3
 *                 items:
 *                   type: string
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Berhasil menyimpan draft.
 */

/**
 * @swagger
 * /api/v1/journals/{id}:
 *   put:
 *     summary: Mengupdate konten jurnal
 *     description: |
 *       Memperbarui data konten (Judul, Note, Images, Video).
 *       - Array `images` akan menggantikan gambar lama (Maksimal 3 foto).
 *       - File `video` akan menimpa video lama (Maksimal 1 video).
 *     tags:
 *       - Journal
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               note:
 *                 type: string
 *               images:
 *                 type: array
 *                 maxItems: 3
 *                 items:
 *                   type: string
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Berhasil update.
 */

/**
 * @swagger
 * /api/v1/journals:
 *   get:
 *     summary: Mengambil seluruh daftar jurnal (Published & Favorit)
 *     description: Mengambil semua jurnal dari yang paling baru ke paling lama. Draf tidak ditampilkan.
 *     tags:
 *       - Journal
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
 *         description: List jurnal berhasil diambil.
 */

/**
 * @swagger
 * /api/v1/journals/search:
 *   get:
 *     summary: Mencari dan memfilter jurnal
 *     description: Mencari jurnal berdasarkan kata kunci (mencakup judul, catatan, dan tag) beserta filter kategori dan waktu. Mendukung paginasi.
 *     tags:
 *       - Journal
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
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, favorites, draft]
 *         description: Kategori jurnal
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal spesifik (YYYY-MM-DD)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai rentang pencarian (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir rentang pencarian (YYYY-MM-DD)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Bulan (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Tahun (contoh 2026)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman paginasi
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Hasil pencarian jurnal berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     size:
 *                       type: integer
 *                     total_data:
 *                       type: integer
 *                     total_page:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */

/**
 * @swagger
 * /api/v1/journals/draft:
 *   get:
 *     summary: Mengambil daftar draf jurnal
 *     description: Mengambil semua jurnal yang masih berstatus draf (is_draft = true) milik pengguna yang sedang login.
 *     tags:
 *       - Journal
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
 *         description: List draf jurnal berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total_data:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /api/v1/journals/favorite:
 *   get:
 *     summary: Mengambil daftar jurnal favorit
 *     description: Mengambil semua jurnal yang ditandai sebagai favorit (is_favorite = true) dan bukan draf.
 *     tags:
 *       - Journal
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
 *         description: Daftar jurnal favorit berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total_data:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */

/**
 * @swagger
 * /api/v1/journals/latest:
 *   get:
 *     summary: Mengambil jurnal terakhir (Published)
 *     tags:
 *       - Journal
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
 *         description: Berhasil.
 */

/**
 * @swagger
 * /api/v1/journals/daily-insight:
 *   get:
 *     summary: Mengambil Daily Insight (Auto-Generate)
 *     tags:
 *       - Journal
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
 *         description: Berhasil.
 */

/**
 * @swagger
 * /api/v1/journals/periodic-insight:
 *   get:
 *     summary: Mengambil periodic Insight
 *     description: Menganalisis riwayat jurnal pengguna dalam periode waktu tertentu menggunakan AI untuk menemukan pola emosi, tema dominan, dan ringkasan psikologis.
 *     tags:
 *       - Journal
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
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Tanggal mulai periode analisis (format ISO 8601, contoh YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Tanggal akhir periode analisis (format ISO 8601, contoh YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Analisis insight periodik berhasil diambil.
 *       400:
 *         description: Validasi parameter gagal.
 *       404:
 *         description: Tidak ada data jurnal pada periode waktu yang diminta.
 */

/**
 * @swagger
 * /api/v1/journals/top-mood:
 *   get:
 *     summary: Mengambil Top Mood
 *     description: Menganalisis riwayat jurnal pengguna dalam periode waktu tertentu untuk menemukan emosi yang paling sering muncul (terbanyak).
 *     tags:
 *       - Journal
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
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Tanggal mulai periode analisis (format ISO 8601, contoh YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Tanggal akhir periode analisis (format ISO 8601, contoh YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Data top mood berhasil diambil.
 *       404:
 *         description: Tidak ada data jurnal pada periode waktu yang diminta.
 */

/**
 * @swagger
 * /api/v1/journals/{id}:
 *   get:
 *     summary: Mengambil detail satu jurnal
 *     tags:
 *       - Journal
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail ditemukan.
 */

/**
 * @swagger
 * /api/v1/journals/{id}/favorite:
 *   patch:
 *     summary: Mengubah status Favorit
 *     tags:
 *       - Journal
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_favorite
 *             properties:
 *               is_favorite:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status favorit berhasil diubah.
 */

/**
 * @swagger
 * /api/v1/journals/{id}/draft:
 *   patch:
 *     summary: Mengubah status Draft/Publish
 *     description: |
 *       Mempublikasikan draft atau mengembalikan ke draft.
 *       - Validasi kelengkapan (Title/Video) berlaku saat mengubah ke Published.
 *     tags:
 *       - Journal
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_draft
 *             properties:
 *               is_draft:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status draft berhasil diubah.
 */

/**
 * @swagger
 * /api/v1/journals/{id}:
 *   delete:
 *     summary: Menghapus jurnal
 *     description: Menghapus data jurnal, video, dan seluruh gambar terkait secara otomatis.
 *     tags:
 *       - Journal
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Berhasil dihapus.
 */

/**
 * @swagger
 * /api/v1/journals/{id}/analyze:
 *   post:
 *     summary: Memicu Analisis Teks (Deep Insight)
 *     tags:
 *       - Journal
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analisis selesai.
 */

/**
 * @swagger
 * /api/v1/journals/{id}/chat:
 *   post:
 *     summary: Chat dengan konteks jurnal ini
 *     tags:
 *       - Journal
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Balasan diterima.
 */

/**
 * @swagger
 * /api/v1/journals/enhance:
 *   post:
 *     summary: Memperbaiki tata bahasa teks (AI)
 *     description: Instruction (fix_grammar, paraphrase, elaboration, general)
 *     tags:
 *       - Journal
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
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: Hari ini aku merasa lelah
 *               instruction:
 *                 type: string
 *                 enum: [fix_grammar, paraphrase, elaboration, general]
 *                 example: fix_grammar
 *     responses:
 *       200:
 *         description: Teks hasil perbaikan.
 */

/**
 * @swagger
 * /api/v1/journals/mood-calendar:
 *   get:
 *     summary: Mengambil Kalender Mood
 *     tags:
 *       - Journal
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
 *         description: Data mood berhasil diambil.
 */
