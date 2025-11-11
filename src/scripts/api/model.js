// src/scripts/api/model.js
const BASE_URL = "https://story-api.dicoding.dev/v1";

export class StoryModel {
  constructor(tokenProvider) {
    this.tokenProvider = tokenProvider;
  }

  // 🔐 Register user baru
  async register({ name, email, password }) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[StoryModel] REGISTER_FAILED:", err);
      throw new Error("REGISTER_FAILED");
    }

    return res.json();
  }

  // 🔑 Login user & ambil token
  async login({ email, password }) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[StoryModel] LOGIN_FAILED:", err);
      throw new Error("LOGIN_FAILED");
    }

    const data = await res.json();
    return data?.loginResult?.token;
  }

  // 📋 Ambil semua story
  async getStories({ page = 1, size = 15, withLocation = true } = {}) {
    const token = this.tokenProvider();
    if (!token) throw new Error("UNAUTHORIZED");

    const url = new URL(`${BASE_URL}/stories`);
    url.searchParams.set("page", page);
    url.searchParams.set("size", size);
    url.searchParams.set("location", withLocation ? "1" : "0");

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[StoryModel] GET_STORIES_FAILED:", err);
      throw new Error("GET_STORIES_FAILED");
    }

    return res.json();
  }

  // 📖 Detail story
  async getDetail(id) {
    const token = this.tokenProvider();
    if (!token) throw new Error("UNAUTHORIZED");

    const res = await fetch(`${BASE_URL}/stories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[StoryModel] DETAIL_FAILED:", err);
      throw new Error("DETAIL_FAILED");
    }

    return res.json();
  }

  // ✍️ Tambah story baru
  async addStory({ description, file, lat, lon }) {
    const token = this.tokenProvider();
    if (!token) throw new Error("UNAUTHORIZED");

    const formData = new FormData();
    formData.append("description", description);
    if (file) formData.append("photo", file);
    if (lat) formData.append("lat", lat);
    if (lon) formData.append("lon", lon);

    console.log("[StoryModel] Uploading story with:", {
      description,
      hasFile: !!file,
      lat,
      lon,
    });

    const res = await fetch(`${BASE_URL}/stories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[StoryModel] ADD_STORY_FAILED:", errorText);
      let message = "Gagal menambah cerita.";
      try {
        const json = JSON.parse(errorText);
        if (json?.message) message = json.message;
      } catch (_) {}
      throw new Error(message);
    }

    const json = await res.json();
    console.log("[StoryModel] ADD_STORY_SUCCESS:", json);
    return json;
  }
}
