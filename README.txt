SILVA STORY APP – Final Version (Toast Modern)

Fitur Utama:
1. PWA aktif (installable, offline mode, cache dinamis)
2. Push notification terintegrasi (perlu VAPID & server)
3. IndexedDB untuk data offline (create, read, delete)
4. Sinkronisasi offline → online otomatis
5. Toast notifikasi modern (visual clean)
   - ✅ Story berhasil disinkronkan
   - ❌ Gagal menyinkronkan story

Posisi toast: pojok kanan atas
Durasi tampil: 3 detik
Animasi: fade-in halus, hilang instan (tanpa fade-out)
Tanpa suara (visual only)

Cara Menguji Toast:
1. Jalankan aplikasi secara lokal:
   npm install
   npm run dev
2. Buka aplikasi (http://localhost:5174)
3. Tambah story (online) → akan muncul toast "Story berhasil disinkronkan"
4. Matikan koneksi internet (DevTools -> Network -> Offline)
5. Tambah story (offline) → tersimpan di IndexedDB
6. Kembalikan koneksi → sistem akan otomatis sinkron dan muncul toast "Story berhasil disinkronkan"
7. Jika koneksi bermasalah → toast error "Gagal menyinkronkan story" muncul

Catatan teknis:
- Untuk push notification: paste PUBLIC VAPID key di src/scripts/components/pushManager.js
- Pastikan token (jika API memerlukan auth) tersimpan di localStorage key 'token'
- Field file pada form adalah 'file' (AddStoryView mengirim { description, file, lat, lon })

Struktur penting:
src/
 ├─ scripts/
 │   ├─ components/
 │   │   ├─ toast.js
 │   │   ├─ idbHelper.js
 │   │   └─ pushManager.js
 │   ├─ views/
 │   │   └─ AddStoryView.js
 │   └─ components/ (lainnya)
 └─ styles/
     └─ styles.css

Good luck & semoga lulus!