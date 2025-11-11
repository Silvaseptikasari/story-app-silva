// src/scripts/components/auth.js

const TOKEN_KEY = "story_token";

/**
 * Modul Auth — menangani penyimpanan, pengambilan,
 * dan penghapusan token autentikasi pengguna.
 */
export const Auth = {
  /**
   * 🧩 Simpan token login ke localStorage.
   * @param {string} token - Token hasil login dari server.
   */
  save(token) {
    if (!token || typeof token !== "string") {
      console.warn("[Auth] Token tidak valid. Penyimpanan dibatalkan.");
      return;
    }

    try {
      localStorage.setItem(TOKEN_KEY, token.trim());
      console.info("[Auth] Token berhasil disimpan.");
    } catch (err) {
      console.error("[Auth] Gagal menyimpan token:", err);
    }
  },

  /**
   * 🔍 Ambil token login dari localStorage.
   * @returns {string|null} Token login pengguna, atau null jika belum login.
   */
  get() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token || token.trim() === "") return null;
      return token.trim();
    } catch (err) {
      console.error("[Auth] Gagal mengambil token:", err);
      return null;
    }
  },

  /**
   * 🚪 Hapus token login dari localStorage (logout).
   */
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      console.info("[Auth] Token berhasil dihapus (logout).");
    } catch (err) {
      console.error("[Auth] Gagal menghapus token:", err);
    }
  },

  /**
   * 🔒 Periksa apakah pengguna sudah login (token tersedia).
   * @returns {boolean} True jika token ada dan valid.
   */
  isAuthed() {
    const token = this.get();
    return Boolean(token && token.length > 10);
  },
};

/* ================================================================
   FUNGSI PEMBANTU — agar tetap kompatibel dengan controller & model
   ================================================================ */

/**
 * Simpan token ke localStorage.
 * @param {string} token
 */
export function saveToken(token) {
  Auth.save(token);
}

/**
 * Ambil token dari localStorage.
 * @returns {string|null}
 */
export function getToken() {
  return Auth.get();
}

/**
 * Hapus token dari localStorage.
 */
export function removeToken() {
  Auth.clear();
}

/**
 * Cek apakah pengguna sudah login.
 * @returns {boolean}
 */
export function isLoggedIn() {
  return Auth.isAuthed();
}

/**
 * Helper tambahan (opsional): ambil header Authorization siap pakai.
 * Berguna untuk fetch API.
 * @returns {{ Authorization: string }|{}}
 */
export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
