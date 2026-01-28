/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Manajemen Profil, Password, dan Pengaturan Akun
 */

/**
 * @swagger
 * /api/v1/user/profile:
 *   put:
 *     summary: Mengupdate nama tampilan user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "User Name Update"
 *     responses:
 *       200:
 *         description: Berhasil mengupdate profil
 *       400:
 *         description: Validasi input gagal
 */

/**
 * @swagger
 * /api/v1/user/password:
 *   put:
 *     summary: Mengganti password user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password berhasil diperbarui, silakan login kembali dengan password baru
 *       401:
 *         description: Password lama salah
 */

/**
 * @swagger
 * /api/v1/user/delete:
 *   delete:
 *     summary: Menghapus akun user secara permanen
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Akun berhasil dihapus
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