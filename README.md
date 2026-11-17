
# 5025251238_Todo-App
<img width="1696" height="1369" alt="image" src="https://github.com/user-attachments/assets/7879c353-7596-485a-970c-8349efc96945" />
README · MD
# ToDo-app
 
Aplikasi todo sederhana dengan penyimpanan lokal, foto dari kamera, pengingat notifikasi, dan aksesibilitas.
 
## Struktur file
 
| File         | Fungsi                                                       |
| ------------ | ------------------------------------------------------------ |
| `index.html` | Struktur halaman: daftar todo, form, dialog kamera           |
| `style.css`  | Tampilan, tema terang/gelap, responsif                       |
| `script.js`  | Logika aplikasi (penyimpanan, kamera, pengingat, render)     |
| `sw.js`      | Service Worker: cache offline dan klik notifikasi            |
 
## Menjalankan
 
Service Worker dan kamera tidak jalan lewat `file://`. Gunakan server lokal:
 
```bash
npx serve
```
 
Buka `http://localhost:3000`.
 
## Cara kerja
 
### 1. Penyimpanan (Web Storage)
 
- **IndexedDB** menyimpan data todo (`id`, `text`, `done`, `remindAt`, `image`, `alt`, `createdAt`). Gambar disimpan langsung sebagai `Blob`.
- **localStorage** hanya menyimpan preferensi tema (`todo-theme`: `light` atau `dark`).
- Fungsi `run(mode, fn)` membungkus transaksi IndexedDB menjadi Promise, dan `save(todo)` memakainya untuk `put`.
- Skrip kecil di `<head>` membaca tema sebelum halaman tampil supaya tidak berkedip. Jika belum ada pilihan, tema mengikuti `prefers-color-scheme`.
### 2. Gambar (Media Capture API)
 
- **Take photo**: `getUserMedia({ video: true })` membuka kamera di dalam `<dialog>`. Tombol Capture menggambar frame video ke `<canvas>`.
- **Upload image**: tombol memicu `<input type="file" accept="image/*">`.
- `shrink()` memperkecil gambar ke lebar maksimal 1024px (JPEG) sebelum disimpan, agar database tidak membengkak.
- Field **Image description** menjadi `alt` gambar saat ditampilkan di daftar.
- Kamera dimatikan otomatis saat dialog ditutup (`onclose`).
### 3. Pengingat dan Service Worker
 
- Field **Remind me at** (`datetime-local`) menyimpan waktu pengingat. Waktu yang sudah lewat ditolak.
- Setiap 15 detik `script.js` mengecek todo yang waktunya sudah tiba, belum selesai, dan belum diberi notifikasi, lalu menampilkan notifikasi dan menandainya `notified`.
- Tombol **Enable notifications** meminta izin browser.
- `sw.js`:
  - `install`: menyimpan file aplikasi ke cache.
  - `activate`: menghapus cache versi lama.
  - `fetch`: melayani file dari cache terlebih dahulu (mode offline).
  - `notificationclick`: membuka atau memfokuskan tab aplikasi.
     
### 4. Aksesibilitas
 
- Skip link "Skip to main content" dan `<main>` yang bisa difokuskan.
- Semua input punya `<label>`; error memakai `role="alert"` dan terhubung lewat `aria-describedby`.
- Pengumuman untuk screen reader (todo ditambah, diubah, dihapus, pengingat) lewat region `role="status"` (`say()`).
- Tombol Edit dan Delete punya `aria-label` yang menyebut isi todo.
- Tombol tema memakai `aria-pressed`.
- Dialog kamera memakai `<dialog>` bawaan: fokus terkunci di dalam dan bisa ditutup dengan Esc; fokus dikembalikan ke tombol semula.
- Indikator fokus jelas (`:focus-visible`), kontras warna cukup di kedua tema, dan animasi dimatikan jika `prefers-reduced-motion`.
- Todo yang selesai ditandai dengan coret teks, bukan hanya warna.
## Alur utama di `script.js`
 
1. `init` (di bagian bawah): terapkan tema, daftarkan `sw.js`, baca semua todo dari IndexedDB, lalu `render()`.
2. Submit form: validasi, buat objek todo, `save()`, perbarui array `todos`, `render()`.
3. `render()`: bangun `<li>` untuk tiap todo dengan `textContent` (aman dari XSS), lalu ganti isi daftar.
4. Edit: `startEdit()` mengisi form dengan data todo; submit berikutnya menimpa todo yang sama (id sama).
5. Hapus: hapus dari IndexedDB dan dari array, lalu `render()`.

