export class AuthController {
  constructor(model, view, authStorage) {
    this.model = model;
    this.view = view;
    this.authStorage = authStorage;
  }

  /**
   * 🔑 Menangani proses login pengguna
   * @param {string} email
   * @param {string} password
   */
  async handleLogin(email, password) {
    // Validasi input sederhana
    if (!email || !password) {
      this.view.renderError("Email dan password wajib diisi.");
      return;
    }

    this.view.showLoading("Sedang memproses login...");

    try {
      const token = await this.model.login({ email, password });

      if (!token) {
        throw new Error("Token tidak ditemukan. Periksa kembali kredensial Anda.");
      }

      // Simpan token ke penyimpanan (localStorage / session)
      this.authStorage.save(token);

      this.view.renderSuccess("Login berhasil. Selamat datang kembali!");

      // Jalankan event callback jika disediakan oleh view
      if (typeof this.view.onLoggedIn === "function") {
        this.view.onLoggedIn();
      }
    } catch (error) {
      console.error("Login error:", error);
      this.view.renderError(
        "Login gagal. Pastikan email dan kata sandi benar atau coba lagi nanti."
      );
    }
  }

  /**
   * 📝 Menangani pendaftaran akun baru
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  async handleRegister(name, email, password) {
    // Validasi input sederhana
    if (!name || !email || !password) {
      this.view.renderError("Semua kolom wajib diisi untuk mendaftar.");
      return;
    }

    this.view.showLoading("Sedang membuat akun...");

    try {
      const result = await this.model.register({ name, email, password });

      if (!result) {
        throw new Error("Server tidak merespons dengan benar.");
      }

      this.view.renderSuccess("Akun berhasil dibuat. Silakan login sekarang.");

      if (typeof this.view.onRegistered === "function") {
        this.view.onRegistered();
      }
    } catch (error) {
      console.error("Register error:", error);
      this.view.renderError(
        "Gagal membuat akun. Gunakan email lain dan pastikan password minimal 8 karakter."
      );
    }
  }

  /**
   * 🚪 Menangani proses logout
   */
  handleLogout() {
    try {
      this.authStorage.clear();
      this.view.renderSuccess("Anda berhasil keluar dari akun.");

      if (typeof this.view.onLoggedOut === "function") {
        this.view.onLoggedOut();
      }
    } catch (error) {
      console.error("Logout error:", error);
      this.view.renderError("Gagal keluar. Coba lagi nanti.");
    }
  }
}
