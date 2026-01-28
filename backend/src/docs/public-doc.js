/**
 * @swagger
 * tags:
 *   - name: Auth Public
 *     description: Endpoint Autentikasi Publik (Register, Login, Lupa Password)
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Mendaftarkan pengguna baru
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
 *                 example: "Name User"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Rahasia123!"
 *                 description: Minimal 6 karakter
 *     responses:
 *       201:
 *         description: Registrasi berhasil
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
 *                       example: "uid_firebase_123"
 *                     name:
 *                       type: string
 *                       example: "Name User"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     message:
 *                       type: string
 *                       example: "Registrasi berhasil. Silakan cek email Anda untuk verifikasi."
 *       400:
 *         description: Validasi gagal atau email sudah terdaftar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sudah terdaftar"
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login pengguna (Firebase Auth)
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
 *                 example: "user@example.com"
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
 *                       description: Firebase ID Token (Bearer)
 *                       example: "eyJhbGciOiJSUzI1NiIs..."
 *                     refreshToken:
 *                       type: string
 *                       example: "AEu4IL0..."
 *                     expiresIn:
 *                       type: string
 *                       example: "3600"
 *                     user:
 *                       type: object
 *                       properties:
 *                         uid:
 *                           type: string
 *                           example: "uid_firebase_123"
 *                         name:
 *                           type: string
 *                           example: "Name User"
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         email_verified_at:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *       401:
 *         description: Email atau password salah
 *       403:
 *         description: Akun dinonaktifkan
 *       429:
 *         description: Terlalu banyak percobaan login
 *       500:
 *         description: Layanan login bermasalah
 */

/**
 * @swagger
 * /api/v1/auth/email/verify:
 *   get:
 *     summary: Verifikasi email pengguna
 *     tags:
 *       - Auth Public
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT verifikasi email
 *     responses:
 *       200:
 *         description: Email berhasil diverifikasi atau sudah diverifikasi sebelumnya
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email berhasil diverifikasi! Akun Anda kini aktif."
 *                 email_verified_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Token verifikasi tidak ada
 *       403:
 *         description: Token tidak valid atau sudah kadaluarsa
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Mengirim link reset password ke email
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
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Link reset password berhasil dikirim
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Link reset password telah dikirim ke email Anda."
 *       404:
 *         description: Email tidak terdaftar
 *       500:
 *         description: Gagal mengirim email reset password
 */

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password menggunakan token
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
 *               - token
 *               - password
 *               - password_confirmation
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               token:
 *                 type: string
 *                 description: Token reset password (JWT)
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password baru (min 6 karakter)
 *                 example: "PasswordBaru123!"
 *               password_confirmation:
 *                 type: string
 *                 format: password
 *                 description: Konfirmasi password baru
 *                 example: "PasswordBaru123!"
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password berhasil diubah. Silakan login dengan password baru."
 *       400:
 *         description: Token tidak valid, kadaluarsa, atau konfirmasi password tidak cocok
 *       404:
 *         description: User tidak ditemukan
 *       500:
 *         description: Gagal mengupdate password
 */