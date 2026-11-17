# To-Do Offline & Install
<img width="2318" height="1313" alt="Screenshot From 2026-11-17 15-08-44" src="https://github.com/user-attachments/assets/99597cce-49bd-4006-808f-2c86afb002e0" />

```
php -S localhost:8000
```
 
## Yang ditambahkan
 
* `manifest.json`: nama, `display: standalone`, `start_url`, dan ikon 192/512 (termasuk maskable) di `icons/`. Di-link dari `index.php` bersama `theme-color` dan `apple-touch-icon`.
* `offline.html`: halaman cadangan jika halaman belum pernah tersimpan di cache.
* Tombol **Install app** (`menubar.php`): tersembunyi sampai browser memicu `beforeinstallprompt`, lalu hilang setelah diklik atau app terpasang (`script.js`).
## Cache (`sw.js`)
 
* `install`: precache app shell (`offline.html`, `style.css`, `script.js`, `manifest.json`, ikon).
* `activate`: hapus cache versi lama.
* `fetch`, strategi per resource:
    * Halaman PHP: network-first, lalu salinan cache, lalu `offline.html`.
    * `uploads/`: cache-first (nama file acak, tidak berubah).
    * CSS, JS, ikon, manifest: stale-while-revalidate.
* Hanya request GET satu origin yang ditangani; POST tidak disentuh.
* Ubah `todo-vN` di `sw.js` setiap file yang di-precache berubah.
## Tes offline
 
1. Saat online, buka halaman **Personal** dan **Shared** sekali (halaman tersimpan saat dikunjungi).
2. DevTools → Application → Cache Storage: pastikan ada entri halaman selain precache.
3. Network → Offline, lalu refresh: halaman yang pernah dibuka tetap tampil.
Halaman yang belum pernah dibuka menampilkan `offline.html`. Form tambah, edit, dan hapus tidak berfungsi offline karena butuh server.
