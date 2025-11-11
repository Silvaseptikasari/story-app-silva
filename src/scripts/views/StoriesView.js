// src/scripts/views/StoriesView.js
import { el, $, $$ } from "../components/dom.js";
import { createMap, destroyMap, addMarker } from "../components/map.js";

export class StoriesView {
  async loadStories(apiFetchFn) {
    // apiFetchFn is optional function that returns stories from API
    try {
      if (NetworkHelper.isOnline() && apiFetchFn) {
        const data = await apiFetchFn();
        if (data && data.length) return data;
      }
    } catch (e) {
      console.warn('API fetch failed, falling back to local', e);
    }
    // Fallback to IndexedDB
    try {
      const local = await getStoriesLocal();
      return local || [];
    } catch (e) {
      console.error('Failed to read local stories', e);
      return [];
    }
  }
  constructor(presenter) {
    this.presenter = presenter;
    this._map = null;
  }

  render() {
    const main = $("#main");
    if (!main) {
      console.error("[StoriesView] Elemen #main tidak ditemukan!");
      return;
    }

    main.innerHTML = "";

    const section = el("section", {}, [
      el("h2", {}, "📖 Stories Terbaru"),
      el("div", { id: "status", "aria-live": "polite", class: "status" }, "Memuat stories..."),
      el("div", { id: "list", class: "grid" }),
      el("div", { class: "map-wrap", style: "margin-top: 1rem;" }, [
        el("div", { id: "map", style: "height: 300px;" }),
      ]),
    ]);

    main.appendChild(section);

    // ✅ panggil controller sesuai nama function sebenarnya
    try {
      this.presenter.fetchStories();
    } catch (err) {
      console.error("[StoriesView] Gagal memanggil presenter:", err);
      this.renderError("Terjadi kesalahan saat memuat data.");
    }
  }

  showLoading(text = "Sedang memuat...") {
    const status = $("#status");
    if (status) status.textContent = text;
  }

  renderError(message = "Terjadi kesalahan.") {
    const status = $("#status");
    if (status) status.textContent = message;
    const list = $("#list");
    if (list) list.innerHTML = "";
    destroyMap();
  }

  renderStories(items = []) {
    const list = $("#list");
    if (!list) return;

    list.innerHTML = "";
    destroyMap();

    this._map = createMap("map", {
      center: [-2.5, 118],
      zoom: 4,
    });

    if (!items || items.length === 0) {
      $("#status").textContent = "Belum ada story.";
      return;
    }

    items.forEach((story) => {
      const card = el("article", { class: "card", tabindex: "0" }, [
        el("img", {
          src: story.photoUrl || "https://via.placeholder.com/400x200?text=No+Image",
          alt: `Foto story oleh ${story.name || "Pengguna"}`,
          loading: "lazy",
        }),
        el("div", { class: "content" }, [
          el("h3", {}, story.name || "Pengguna"),
          el("p", {}, story.description || "Tanpa deskripsi"),
          el("p", { class: "meta" }, [
            "ID: ",
            el("code", {}, story.id || "-"),
            " • ",
            new Date(story.createdAt).toLocaleString("id-ID"),
          ]),
          el("a", { class: "button", href: `#/detail/${story.id}` }, "Lihat detail"),
        ]),
      ]);

      list.appendChild(card);

      if (typeof story.lat === "number" && typeof story.lon === "number") {
        addMarker(
          this._map,
          story.lat,
          story.lon,
          `<b>${story.name || "Pengguna"}</b><br/>${story.description || ""}`
        );
      }
    });

    $("#status").textContent = "";
  }

  destroy() {
    destroyMap();
    const list = $("#list");
    if (list) list.innerHTML = "";
  }
}
