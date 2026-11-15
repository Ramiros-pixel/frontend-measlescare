TASK: REDESAIN DAN PENGEMBANGAN ADMIN DASHBOARD MEASLESCARE

Saya ingin mengembangkan dan mendesain ulang seluruh halaman Admin MeaslesCare berdasarkan 7 gambar referensi UI yang sudah saya kirimkan melalui Telegram.

Project frontend berada di:
D:\MeaslesCare\frontend-measlescare

## 1. Tujuan Pengerjaan

Fokus utama adalah membangun UI Admin MeaslesCare yang modern, profesional, konsisten, responsif, dan sesuai dengan gambar referensi.

Halaman User sudah selesai dikembangkan. Oleh karena itu, jangan mengubah atau merusak halaman User yang sudah ada.

Fokus hanya pada frontend Admin.

## 2. Teknologi Project

Gunakan teknologi yang sudah tersedia:

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- TanStack Query 5

Gunakan struktur, komponen, API, dan dependensi yang sudah tersedia. Hindari menambahkan library baru jika tidak diperlukan.

## 3. Acuan Desain

Gunakan 7 gambar referensi yang sudah saya kirim sebagai acuan utama.

Desain yang diharapkan:

- Sidebar berwarna navy/dark blue di sebelah kiri.
- Brand MeaslesCare dengan ikon dan identitas Admin Fasilitas Kesehatan.
- Menu sidebar dibagi menjadi Menu Utama dan Manajemen Sistem.
- Header berisi judul halaman, tanggal, notifikasi, dan profil Admin.
- Background konten berwarna biru keabu-abuan yang lembut.
- Card berwarna putih dengan rounded corner dan shadow halus.
- Statistik ditampilkan menggunakan stat cards.
- Tabel memiliki header yang jelas, status badge, dan pagination.
- Grafik menggunakan visualisasi yang rapi dan mudah dipahami.
- Gunakan responsive layout untuk desktop, tablet, dan mobile.

Gunakan Public Sans dan perhatikan konsistensi warna, ukuran font, spacing, serta komponen.

Tetap perhatikan aksesibilitas dan kontras warna.

## 4. Halaman yang Harus Dikembangkan

Kembangkan seluruh 7 halaman berikut:

### A. Dashboard Admin

- Total pasien.
- Jumlah skrining hari ini.
- Hasil skrining berdasarkan kategori.
- Tren skrining selama 7 hari.
- Distribusi hasil skrining.
- Gejala yang paling sering ditemukan.
- Aktivitas skrining terbaru.

### B. Manajemen Pasien

- Daftar pasien.
- Pencarian pasien.
- Filter data.
- Detail pasien.
- Riwayat skrining pasien.
- Informasi RFID jika tersedia.
- Pagination.

### C. Data Skrining

- Daftar seluruh data skrining.
- Pencarian dan filter.
- Informasi waktu pemeriksaan.
- Identitas pasien.
- Suhu tubuh dan gejala.
- Status hasil skrining.
- Detail pemeriksaan menggunakan drawer atau panel.
- Informasi foto ruam dan hasil deteksi AI jika datanya tersedia.

### D. Laporan & Statistik

- Ringkasan statistik skrining.
- Filter rentang tanggal.
- Tab harian, mingguan, dan bulanan.
- Grafik tren skrining.
- Distribusi hasil skrining.
- Rekap gejala.
- Fitur ekspor jika memungkinkan untuk dibuat secara fungsional.

### E. Perangkat Kiosk

- Daftar perangkat kiosk.
- Status perangkat.
- Informasi kamera dan sensor.
- Aktivitas terakhir.
- Detail perangkat.
- Status komponen perangkat.

### F. Manajemen Pengguna

- Daftar pengguna.
- Informasi nama dan username.
- Role pengguna.
- Status akun.
- Pencarian dan filter.
- Detail pengguna.

### G. Pengaturan

Buat tampilan pengaturan dengan tab:

- Profil Fasilitas.
- Aturan Skrining.
- Konfigurasi Kiosk.
- Keamanan & Akses.
- Audit Log.

Fitur yang belum didukung backend harus ditandai dengan jelas sebagai belum tersedia atau simulasi.

## 5. Ketentuan Sumber Data dan Mock Data

Saya memilih menggunakan opsi 1, yaitu mock data lokal terlebih dahulu.

Ketentuannya:

1. Buat mock data secara terpisah di folder `src/mock/`.
2. Untuk fitur yang sudah memiliki endpoint backend, tetap gunakan API yang tersedia.
3. Gunakan mock data untuk fitur yang belum memiliki endpoint, seperti:
   - Data RFID.
   - Perangkat Kiosk.
   - Pengaturan fasilitas.
   - Aturan skrining.
   - Audit Log.
   - Statistik tambahan.
4. Jangan menggabungkan mock data dengan data API tanpa penanda yang jelas.
5. Jangan menampilkan data simulasi seolah-olah merupakan data asli dari database.
6. Buat struktur mock data yang mudah diganti dengan API ketika backend dikembangkan nanti.
7. Jangan membuat backend baru atau mengubah backend FastAPI.

Untuk data yang sudah tersedia, gunakan endpoint yang ada:

- `/auth`
- `/users`
- `/gejala`
- `/gejala/history`
- `/camera`

Gunakan file API dan tipe data yang sudah tersedia di project.

## 6. Ketentuan Teknis

- Pertahankan sistem autentikasi yang sudah ada.
- Pertahankan AuthContext.
- Pertahankan RequireAuth dan pemeriksaan role Admin.
- Pertahankan mekanisme token dan API client.
- Jangan mengubah halaman User.
- Jangan menghapus fungsi yang masih digunakan.
- Jangan membuat data statistik palsu untuk menggantikan data API.
- Jangan membuat tombol yang tidak memiliki fungsi tanpa penanda.
- Jangan mengubah file `.env` atau mengekspos API key maupun token.
- Jangan melakukan commit, push, atau deploy tanpa persetujuan saya.

Jika diperlukan, buat komponen UI reusable seperti:

- StatCard.
- DataTable.
- Pagination.
- StatusBadge.
- Drawer.
- Modal.
- Tabs.
- FilterToolbar.
- Chart.

Pastikan seluruh komponen memiliki desain yang konsisten.

## 7. Tahapan Pengerjaan

Sebelum mengubah kode:

1. Periksa kembali struktur project.
2. Pelajari file `DESIGN.md` dan `Documentation.md`.
3. Periksa seluruh halaman Admin yang sudah ada.
4. Periksa routing dan komponen layout.
5. Periksa API, types, dan autentikasi.
6. Identifikasi komponen yang bisa digunakan kembali.

Setelah itu, langsung lanjutkan implementasi. Jangan berhenti hanya pada tahap analisis atau perencanaan.

Prioritaskan:

1. AdminLayout dan sidebar.
2. Header dan komponen UI reusable.
3. Dashboard.
4. Manajemen Pasien.
5. Data Skrining dan halaman detail.
6. Laporan & Statistik.
7. Perangkat Kiosk.
8. Manajemen Pengguna.
9. Pengaturan.

Sesuaikan routing jika diperlukan, tetapi pertahankan seluruh routing User yang sudah berjalan.

## 8. Testing

Setelah implementasi:

- Jalankan `npm run build`.
- Perbaiki seluruh error TypeScript atau build yang muncul akibat perubahan.
- Jalankan lint jika memungkinkan.
- Periksa seluruh routing Admin.
- Pastikan halaman User tetap berjalan.
- Pastikan tidak ada error pada browser console.
- Periksa tampilan responsif.

## 9. Hasil Akhir

Setelah selesai, berikan laporan yang mencakup:

1. Halaman Admin yang berhasil dibuat.
2. Komponen baru yang dibuat.
3. File yang diubah dan ditambahkan.
4. Fitur yang menggunakan API backend.
5. Fitur yang masih menggunakan mock data.
6. Fitur yang belum dapat difungsikan karena keterbatasan backend.
7. Hasil build dan testing.

Target akhirnya adalah seluruh 7 halaman Admin memiliki UI yang lengkap, konsisten, dan semirip mungkin dengan gambar referensi.

Silakan mulai pengerjaan langsung di project tersebut. Jangan mengubah backend dan jangan mengganggu halaman User yang sudah selesai.
