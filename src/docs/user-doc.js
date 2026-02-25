/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Manajemen Profil, Password, dan Pengaturan Akun
 */

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Mendapatkan informasi profil user saat ini
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     responses:
 *       200:
 *         description: Berhasil mengambil data profil
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
 *                       example: "7s8d6f87s6d8f76s8d7f"
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     bio:
 *                       type: string
 *                       example: "Fullstack Developer Enthusiast"
 *                     photoUrl:
 *                       type: string
 *                       nullable: true
 *                       example: "https://storage.googleapis.com/..."
 *       401:
 *         description: Unauthorized (Token tidak valid)
 */

/**
 * @swagger
 * /api/v1/user/profile:
 *   put:
 *     summary: Mengupdate data profil (Nama & Bio saja)
 *     description: Endpoint ini hanya untuk mengubah Nama dan Bio. Perubahan Email memiliki API tersendiri.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: (Opsional) Nama baru (Min 5 chars)
 *                 example: "User Name Update"
 *               bio:
 *                 type: string
 *                 description: (Opsional) Bio user (Max 255 chars)
 *                 example: "Ini adalah bio baru saya"
 *     responses:
 *       200:
 *         description: Berhasil mengupdate profil
 *       400:
 *         description: Validasi input gagal
 */

/**
 * @swagger
 * /api/v1/user/profile/language:
 *   patch:
 *     summary: Mengubah preferensi bahasa user
 *     description: Menyimpan preferensi bahasa (id atau en) user ke database agar disinkronisasikan antar perangkat.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [id, en]
 *                 example: "en"
 *     responses:
 *       200:
 *         description: Bahasa berhasil diubah
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
 *                       example: "Language updated successfully."
 *                     language:
 *                       type: string
 *                       example: "en"
 *       400:
 *         description: Validasi input gagal
 *       401:
 *         description: Unauthorized (Token tidak valid atau tidak ada)
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /api/v1/user/email/change-request:
 *   post:
 *     summary: Request perubahan email (Kirim OTP)
 *     description: Mengirimkan kode OTP ke alamat email baru yang dituju.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *     responses:
 *       200:
 *         description: OTP berhasil dikirim ke email baru
 *       400:
 *         description: Email sudah digunakan atau format salah
 */

/**
 * @swagger
 * /api/v1/user/email/change-verify:
 *   post:
 *     summary: Verifikasi OTP perubahan email
 *     description: Memasukkan kode OTP untuk meresmikan perubahan email di sistem Auth dan Firestore.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Email berhasil diubah
 *       400:
 *         description: OTP salah atau kadaluarsa
 */

/**
 * @swagger
 * /api/v1/user/profile/picture:
 *   patch:
 *     summary: Mengganti foto profil user (Upload Image)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File gambar (JPG/PNG, Max 2MB).
 *     responses:
 *       200:
 *         description: Berhasil mengupdate foto profil
 *       400:
 *         description: File wajib diupload
 */

/**
 * @swagger
 * /api/v1/user/profile/picture:
 *   delete:
 *     summary: Menghapus foto profil (Reset ke Default)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     responses:
 *       200:
 *         description: Foto profil berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /api/v1/user/password/change-request:
 *   post:
 *     summary: Langkah 1 - Request Ganti Password
 *     description: Memverifikasi password lama. Jika benar, sistem akan mengirimkan kode OTP ke email user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: "PasswordLama123!"
 *     responses:
 *       200:
 *         description: Password lama benar, OTP dikirim ke email
 *       401:
 *         description: Password lama salah
 */

/**
 * @swagger
 * /api/v1/user/password/change-validate:
 *   post:
 *     summary: Langkah 2 - Validasi OTP Ganti Password
 *     description: Mengecek apakah OTP benar sebelum user diizinkan mengisi password baru.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: OTP Valid
 *       400:
 *         description: OTP Salah atau Kadaluarsa
 */

/**
 * @swagger
 * /api/v1/user/password/change-verify:
 *   post:
 *     summary: Langkah 3 - Verifikasi OTP & Simpan Password Baru
 *     description: Memvalidasi OTP yang dikirim dan mengganti password di Firebase Auth.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "1234"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "PasswordBaru123!"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "PasswordBaru123!"
 *     responses:
 *       200:
 *         description: Password berhasil diperbarui
 *       400:
 *         description: OTP salah atau tidak valid
 */

/**
 * @swagger
 * /api/v1/user/delete-request:
 *   post:
 *     summary: Langkah 1 - Request Hapus Akun (Kirim OTP)
 *     description: Mengirim kode OTP konfirmasi ke email sebelum menghapus akun secara permanen.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     responses:
 *       200:
 *         description: Kode OTP dikirim ke email
 *       429:
 *         description: Terlalu banyak permintaan (Rate Limit)
 */

/**
 * @swagger
 * /api/v1/user/delete:
 *   delete:
 *     summary: Langkah 2 - Hapus Akun Permanen (Verifikasi OTP)
 *     description: Menghapus data user dari Auth dan Firestore selamanya.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Akun berhasil dihapus
 *       400:
 *         description: OTP salah atau kadaluarsa
 */

/**
 * @swagger
 * /api/v1/fcm/token:
 *   post:
 *     summary: Menyimpan FCM Token
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           enum: [id, en]
 *           default: id
 *         required: false
 *         description: Preferensi bahasa untuk pesan respons API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token berhasil disimpan
 */
