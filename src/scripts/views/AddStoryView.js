// src/scripts/views/AddStoryView.js
import { el, $ } from "../components/dom.js";
import { addStoryLocal } from "../components/idbHelper.js";
import { NetworkHelper } from "../utils/networkHelper.js";
import { syncLocalStories } from "../components/syncHelper.js";
import { createMap, destroyMap, addMarker } from "../components/map.js";
import { CameraController } from "../components/camera.js";
import { showToast } from '../components/toast.js';

export class AddStoryView {
  constructor(controller) {
    this.controller = controller;
    this._cam = null;
    this._map = null;
    this._marker = null;
    this._picked = null;
  }

  render() {
    const main = $("#main");
    main.innerHTML = "";

    main.append(
      el("section", {}, [
        el("h2", {}, "Tambah Story"),
        el(
          "p",
          { class: "helper" },
          "Ambil foto dari kamera atau unggah file. Klik peta untuk memilih lokasi."
        ),

        // ======================
        // 🧩 FORM MULAI DI SINI
        // ======================
        el("form", { id: "addForm", class: "form" }, [
          // ✏️ Deskripsi
          el("div", {}, [
            el("label", { for: "desc" }, "Deskripsi"),
            el("textarea", {
              id: "desc",
              required: true,
              maxlength: 300,
              "aria-describedby": "descHelp",
              placeholder: "Tulis deskripsi singkat...",
            }),
            el(
              "p",
              { id: "descHelp", class: "helper" },
              "Maksimal 300 karakter."
            ),
          ]),

          // 📷 Kamera / File Upload
          el("fieldset", { style: "border:none; padding:0" }, [
            el("legend", {}, "Gambar"),
            el("div", { class: "kv" }, [
              el(
                "label",
                { for: "fileInput" },
                "Pilih file atau ambil gambar:"
              ),
              el(
                "button",
                {
                  type: "button",
                  id: "openCam",
                  class: "button",
                  "aria-label": "Buka kamera untuk mengambil gambar",
                },
                "Buka Kamera"
              ),
              el(
                "button",
                {
                  type: "button",
                  id: "capture",
                  class: "button primary",
                  "aria-label": "Ambil foto dari kamera",
                },
                "Jepret"
              ),
              el(
                "button",
                {
                  type: "button",
                  id: "closeCam",
                  class: "button danger",
                  hidden: true,
                  "aria-label": "Tutup kamera",
                },
                "Tutup Kamera"
              ),
              el("input", {
                type: "file",
                id: "fileInput",
                accept: "image/*",
              }),
            ]),
            el("div", { class: "kv" }, [
              el("video", {
                id: "video",
                playsinline: true,
                style: "max-width:260px; border-radius:.5rem",
                "aria-label": "Tampilan kamera",
              }),
              el("canvas", {
                id: "canvas",
                style: "max-width:260px; border-radius:.5rem",
                "aria-label": "Hasil tangkapan kamera",
              }),
            ]),
          ]),

          // 🗺️ Peta Lokasi
          el("fieldset", { style: "border:none; padding:0" }, [
            el("legend", {}, "Lokasi"),
            el("div", { class: "map-wrap" }, [
              el("div", {
                id: "map",
                "aria-label": "Peta untuk memilih lokasi story",
              }),
            ]),
            el("p", { class: "helper" }, [
              "Klik peta untuk memilih lokasi. Posisi: ",
              el("span", { id: "picked" }, "belum dipilih"),
            ]),
          ]),

          // 🔘 Tombol Aksi
          el("div", { class: "kv" }, [
            el(
              "button",
              { type: "submit", class: "button primary" },
              "Kirim Story"
            ),
            el("a", { href: "#/stories", class: "button" }, "Batal"),
          ]),

          el("div", { id: "status", "aria-live": "polite" }),
        ]),
      ])
    );

    // ======================
    // 🎥 Inisialisasi Kamera
    // ======================
    const video = $("#video");
    const canvas = $("#canvas");
    const openCamBtn = $("#openCam");
    const closeCamBtn = $("#closeCam");

    this._cam = new CameraController(video, canvas, $("#capture"));

    openCamBtn.addEventListener("click", async () => {
      await this._cam.start();
      closeCamBtn.hidden = false;
    });

    closeCamBtn.addEventListener("click", () => {
      this._cam.stop();
      closeCamBtn.hidden = true;
    });

    // ======================
    // 🗺️ Inisialisasi Peta
    // ======================
    this._map = createMap("map", {
      center: [-2.5, 118],
      zoom: 4,
      onClick: (latlng) => {
        this._picked = latlng;
        $("#picked").textContent = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
        if (this._marker) this._map.removeLayer(this._marker);
        this._marker = addMarker(
          this._map,
          latlng.lat,
          latlng.lng,
          "Lokasi dipilih"
        );
      },
    });

    // ======================
    // 📤 Event Submit Form
    // ======================
    $("#addForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const desc = $("#desc").value.trim();
      let file = null;

      const blob = this._cam?.getBlob?.();
      if (blob) file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      else if ($("#fileInput").files[0]) file = $("#fileInput").files[0];

      const lat = this._picked?.lat;
      const lon = this._picked?.lng;

      if (!desc || !file || lat == null || lon == null) {
        this.renderError("Lengkapi semua field (foto, deskripsi, dan lokasi).");
        return;
      }

      this.showLoading("Mengunggah cerita...");

      try {
        await this.controller.addStory({ description: desc, file, lat, lon });
        try { showToast('Story berhasil disinkronkan', 'success'); } catch(e){}
        this.renderSuccess('Berhasil menambah cerita.');
      } catch (err) {
        this.renderError("Gagal menambah cerita.");
        try { showToast('Gagal menyinkronkan story', 'error'); } catch(e){}
      }
    });
  }

  // ======================
  // 🔧 Feedback UI
  // ======================
  showLoading(text) {
    const s = $("#status");
    s.textContent = text;
    s.style.color = "gray";
  }

  renderError(text) {
    const s = $("#status");
    s.textContent = text;
    s.style.color = "red";
  }

  renderSuccess(text) {
    const s = $("#status");
    s.textContent = text;
    s.style.color = "green";
  }

  onStoryAdded() {
    location.hash = "#/stories";
  }

  destroy() {
    destroyMap();
    this._cam?.stop();
  }
}
