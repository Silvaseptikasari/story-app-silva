import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5174, // ✅ ubah port agar berjalan di http://localhost:5174
    open: true, // opsional: otomatis buka browser saat dijalankan
  },
});
