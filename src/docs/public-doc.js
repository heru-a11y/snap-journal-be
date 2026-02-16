/**
 * @swagger
 * tags:
 *   - name: Auth Public
 *     description: Endpoint Autentikasi Publik (Register, Login, Verifikasi OTP, Lupa Password)
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Mendaftarkan pengguna baru
 *     description: Setelah sukses, sistem akan mengirimkan kode OTP ke email. Jika email sudah terdaftar tapi belum verifikasi, sistem akan otomatis mengirim ulang OTP baru.
 *     tags:
 *       - Auth Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Heru Sudrajat"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "heru@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Minimal 6 karakter
 *                 example: "Rahasia123!"
 *     responses:
 *       200:
 *         description: Registrasi berhasil atau OTP dikirim ulang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     is_resend:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                       example: Registrasi berhasil. Kode OTP telah dikirim ke email Anda.
 *       400:
 *         description: Validasi gagal atau email sudah aktif
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login pengguna (Firebase Auth)
 *     description: User hanya bisa login jika sudah melakukan verifikasi OTP.
 *     tags:
 *       - Auth Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "heru@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Rahasia123!"
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         uid:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         email_verified_at:
 *                           type: string
 *                           format: date-time
 *       403:
 *         description: Akun belum diverifikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: string
 *                   example: Akun belum diverifikasi. Silakan masukkan kode OTP.
 */

/**
 * @swagger
 * /api/v1/auth/email/verify:
 *   post:
 *     summary: Verifikasi Email Registrasi (OTP)
 *     tags:
 *       - Auth Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: "heru@example.com"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Email berhasil diverifikasi
 */

/**
 * @swagger
 * /api/v1/auth/email/send-otp:
 *   post:
 *     summary: Kirim Ulang Kode OTP Registrasi (Resend)
 *     description: Mengirim ulang kode OTP ke email untuk user yang sudah mendaftar tetapi belum verifikasi. Terdapat pembatasan waktu (rate limit) antar permintaan.
 *     tags:
 *       - Auth Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "heru@example.com"
 *     responses:
 *       200:
 *         description: Kode OTP baru berhasil dikirim
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
 *                       example: Kode OTP baru dikirim ke email heru@example.com.
 *                     expires_in:
 *                       type: string
 *                       example: 5 minutes
 *       400:
 *         description: Akun sudah terverifikasi sebelumnya
 *       404:
 *         description: Email tidak ditemukan dalam sistem
 *       429:
 *         description: Terlalu banyak permintaan. Silakan tunggu beberapa saat.
 */

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Langkah 1 - Request OTP Lupa Password
 *     description: Mengirim kode OTP 4 digit ke email untuk memulai proses reset password.
 *     tags:
 *       - Auth Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "heru@example.com"
 *     responses:
 *       200:
 *         description: Kode OTP berhasil dikirim
 */

/**
 * @swagger
 * /api/v1/auth/forgot-password/verify:
 *   post:
 *     summary: Langkah 2 - Verifikasi OTP Lupa Password
 *     description: Validasi kode OTP sebelum pengguna diizinkan masuk ke form password baru.
 *     tags:
 *       - Auth Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: "heru@example.com"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: OTP Valid
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
 *                     email:
 *                       type: string
 *                     otp:
 *                       type: string
 */

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Langkah 3 - Reset Password Baru
 *     description: Mengubah password lama dengan yang baru menggunakan verifikasi email dan OTP.
 *     tags:
 *       - Auth Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - password
 *               - password_confirmation
 *             properties:
 *               email:
 *                 type: string
 *                 example: "heru@example.com"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "PasswordBaru123!"
 *               password_confirmation:
 *                 type: string
 *                 format: password
 *                 example: "PasswordBaru123!"
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 */

/**
 * @swagger
 * /api/v1/test/reminder-job:
 *   get:
 *     summary: "[TEST] Pemicu Manual Personalized AI Reminder"
 *     description: "Memicu background job untuk mengirim push notification AI berdasarkan konteks jurnal terakhir user yang tidak aktif > 48 jam."
 *     tags:
 *       - Testing
 *     responses:
 *       200:
 *         description: Job berhasil dijalankan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job manual berhasil dijalankan. Silakan periksa log terminal backend."
 */
