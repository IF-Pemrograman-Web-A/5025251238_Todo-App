Aplikasi todo untuk organisasi: setiap user punya todo Personal, dan bisa membagikan todo ke menu Shared agar terlihat oleh semua user. Data disimpan di PostgreSQL, gambar disimpan di folder uploads/.
<img width="1841" height="1499" alt="Screenshot From 2026-11-17 14-32-50" src="https://github.com/user-attachments/assets/62bfebe0-c6b4-498b-9b81-528a57d4d503" />
Fitur
Menu samping (sidebar): Personal dan Shared
CRUD todo dengan PHP: tambah, ubah, tandai selesai, hapus
Upload gambar untuk todo (file handling PHP)
Pengingat dengan notifikasi browser dan Service Worker
Tema terang/gelap (disimpan di localStorage)
Aksesibilitas: skip link, label di semua input, aria-current pada menu, pesan untuk screen reader, fokus terlihat jelas
Struktur file
File	Fungsi
index.php	Halaman utama: ambil data, lalu menyusun menu, daftar, dan form
config.php	Koneksi PDO ke PostgreSQL, session, token CSRF, fungsi e() dan fields()
menubar.php	Sidebar (menu Personal/Shared, pilih user demo, tombol notifikasi)
content.php	Daftar todo
form.php	Form tambah/ubah todo
actions.php	Proses CRUD (POST), lalu redirect
data.sql	Struktur tabel dan data dummy
style.css	Tampilan dan tema
script.js	Tema, pendaftaran Service Worker, pengingat
sw.js	Service Worker: cache style.css dan script.js, klik notifikasi
uploads/	Tempat gambar yang diunggah
Requirement
PHP 8.1 atau lebih baru dengan ekstensi pdo_pgsql dan mbstring
PostgreSQL
