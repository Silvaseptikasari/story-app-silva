// src/scripts/controllers/storyController.js
import { getToken } from "../components/auth.js";

export class StoryController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  // ==========================
  // 📜 Ambil semua story
  // ==========================
  async fetchStories() {
    this.view?.showLoading?.("Sedang mengambil daftar cerita...");

    try {
      const response = await this.model.getStories({
        page: 1,
        size: 20,
        withLocation: true,
      });

      if (!response) throw new Error("Respons server kosong.");

      const stories = response.listStory || [];
      if (stories.length === 0) {
        this.view?.renderError?.("Belum ada cerita yang tersedia.");
        return;
      }

      this.view?.renderStories?.(stories);
    } catch (error) {
      console.error("[StoryController] Gagal memuat stories:", error);
      this.view?.renderError?.("Gagal memuat daftar cerita.");
    } finally {
      this.view?.hideLoading?.();
    }
  }

  // ==========================
  // 📖 Ambil detail story
  // ==========================
  async fetchStoryDetail(storyId) {
    if (!storyId) {
      this.view?.renderError?.("ID cerita tidak ditemukan.");
      return;
    }

    this.view?.showLoading?.("Sedang memuat detail cerita...");

    try {
      const result = await this.model.getDetail(storyId);
      if (!result?.story) throw new Error("Detail tidak ditemukan.");
      this.view?.renderDetail?.(result.story);
    } catch (error) {
      console.error("[StoryController] Gagal memuat detail:", error);
      this.view?.renderError?.("Gagal memuat detail cerita.");
    } finally {
      this.view?.hideLoading?.();
    }
  }

  // ==========================
  // 📤 Tambah story baru
  // ==========================
  async addStory(data) {
    const { description, file, lat, lon } = data || {};

    // 🧠 Validasi dasar
    if (!description || !file) {
      this.view?.renderError?.("Deskripsi dan gambar wajib diisi.");
      return;
    }

    // ✅ Pastikan file adalah File atau Blob
    if (!(file instanceof File) && !(file instanceof Blob)) {
      this.view?.renderError?.("File tidak valid atau rusak.");
      return;
    }

    this.view?.showLoading?.("Mengunggah cerita...");

    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan. Silakan login ulang.");

      // 🔧 FormData untuk upload
      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", file);
      if (lat != null && lon != null) {
        formData.append("lat", lat);
        formData.append("lon", lon);
      }

      // 🔥 Panggil API Dicoding resmi
      const response = await fetch("https://story-api.dicoding.dev/v1/stories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // Aman untuk response kosong
      const text = await response.text();
      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch (_) {
        json = {};
      }

      // ⚠️ Validasi hasil dari server
      if (!response.ok) {
        const msg = json?.message || text || "Gagal menambah cerita.";
        throw new Error(msg);
      }

      console.info("[StoryController] Upload sukses:", json);
      this.view?.renderSuccess?.("Cerita berhasil ditambahkan!");

      // Arahkan balik ke daftar story
      if (typeof this.view?.onStoryAdded === "function") {
        setTimeout(() => this.view.onStoryAdded(), 1000);
      }
    } catch (error) {
      console.error("[StoryController] Upload gagal:", error);
      this.view?.renderError?.(error.message || "Gagal menambah cerita.");
    } finally {
      this.view?.hideLoading?.();
    }
  }
}
