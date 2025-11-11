// src/scripts/components/camera.js

export class CameraController {
  constructor(videoEl, canvasEl, btnCapture) {
    this.video = videoEl;
    this.canvas = canvasEl;
    this.btnCapture = btnCapture;
    this.stream = null;
    this.currentBlob = null;

    // Tambahan keamanan agar event tidak didaftarkan dua kali
    this._onCaptureClick = this.capture.bind(this);
  }

  async start() {
    try {
      // Minta izin kamera
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      // Hubungkan stream ke elemen video
      this.video.srcObject = this.stream;
      await this.video.play();

      // Pastikan hanya satu event listener
      this.btnCapture?.removeEventListener("click", this._onCaptureClick);
      this.btnCapture?.addEventListener("click", this._onCaptureClick);

      console.log("[CameraController] Kamera berhasil dimulai.");
    } catch (err) {
      console.error("[CameraController] Gagal membuka kamera:", err);
      alert("Gagal membuka kamera. Pastikan izin kamera sudah diaktifkan.");
    }
  }

  stop() {
    try {
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
        console.log("[CameraController] Kamera dihentikan.");
      }
      if (this.video) this.video.srcObject = null;
    } catch (err) {
      console.error("[CameraController] Gagal menghentikan kamera:", err);
    }
  }

  capture() {
    try {
      if (!this.video || this.video.readyState < 2) {
        alert("Kamera belum siap, coba lagi.");
        return;
      }

      const w = this.video.videoWidth;
      const h = this.video.videoHeight;

      if (w === 0 || h === 0) {
        alert("Gagal mengambil gambar. Pastikan kamera aktif.");
        return;
      }

      const ctx = this.canvas.getContext("2d");
      this.canvas.width = w;
      this.canvas.height = h;
      ctx.drawImage(this.video, 0, 0, w, h);

      // Simpan hasil tangkapan ke blob
      this.canvas.toBlob(
        (blob) => {
          this.currentBlob = blob;
          console.log("[CameraController] Gambar berhasil diambil.");
        },
        "image/jpeg",
        0.9
      );
    } catch (err) {
      console.error("[CameraController] Gagal mengambil gambar:", err);
      alert("Terjadi kesalahan saat mengambil gambar.");
    }
  }

  getBlob() {
    return this.currentBlob;
  }
}
