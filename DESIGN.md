# DESIGN.md - MeaslesCare Web

Direkripsi dari instruksi pemilik proyek (nuansa biru medis, bersih, tepercaya).
Semua keputusan di bawah membawa alasannya (R-31).

## Identitas

- Nama produk: MeaslesCare, aplikasi pencatatan gejala campak dengan deteksi kamera.
- Karakter: tenang, teliti, layanan kesehatan publik. Bukan landing page marketing; ini alat kerja harian.
- Bahasa UI: Indonesia yang singkat dan lugas. Tidak ada buzzword (R-16), tidak ada emoji dekorasi (R-04).

## Palet (R-29: 1 warna inti biru + netral + 4 warna semantik fungsional)

- Primary: `#175CD3` (biru medis). Alasan: biru diasosiasikan dengan layanan kesehatan dan keterpercayaan, sesuai arah pemilik.
- Primary hover: `#124FB8`. Alasan: gelap 12% dari primary untuk umpan balik tekan.
- Primary soft: `#EAF1FD`. Alasan: latar sekunder untuk area aktif/tumpuan ringan tanpa menyaingi konten.
- Surface: `#FFFFFF`, surface muted `#F8FAFC`, border `#D8E0EA`, text `#0F172A`, muted text `#46586E`.
- Semantik (hanya untuk status, tidak dipakai dekoratif): success `#067647`, warning `#B54708`, danger `#B42318`, info `#175CD3`.
- Skala 50-900 biru disediakan sebagai token `--blue-50..900` untuk kebutuhan turunan; komponen memakai token semantik di atas, bukan skala mentah.
- Kontras: pasangan teks/latar diverifikasi dengan contrast-check.py (R-25), normal 4.5:1, besar 3:1, non-teks 3:1.

## Tipografi (R-06)

- Satu keluarga: Public Sans (variable 400-700, di-host sendiri di /fonts).
- Alasan: grotesque netral dengan angka tabular-friendly yang jelas; dibaca nyaman untuk data kesehatan, bukan font default model.
- Hierarki: heading 700, body 400/500, ukuran 14-16px dasar, fluid dengan clamp() pada heading (mobile-first).

## Layout (R-03, mobile-first)

- Area pengguna: alur linear satu kolom, nav bawah di ponsel, tap target minimal 44px.
- Area admin: sidebar di desktop (navigasi 4 tujuan), tabel padat; di ponsel sidebar menjadi nav bawah.
- Radius: sm 8px (badge/input kecil), md 10px (tombol, input), lg 14px (kartu, dialog). Bukan semua pill (R-11).
- Shadow: satu tingkat elevation untuk elemen yang mengangkat (dropdown, dialog) saja; kartu datar dengan border (R-12).
- Tidak ada gradien, glow, glassmorphism, pattern latar, status dot dekoratif (R-01, R-07, R-10, R-13).

## Tema

- Terang saja. Alasan (R-21): aplikasi pemeriksaan kesehatan dengan banyak data teks di berbagai pencahayaan; tidak ada alasan brand untuk gelap, dan toggle dua tema menambah permukaan kesalahan tanpa manfaat.

## Motion (MOTION 1)

- Hover/focus/active states dan transisi warna 120ms saja. Tidak ada scroll-reveal, parallax, atau loop animasi (R-19).

## Dial

- ENERGY 1 / RHYTHM 1 / MOTION 1: alat kerja, bukan panggung; konsistensi dan kejelasan lebih penting daripada variasi komposisi.

## Motif identitas

- "Strip status": setiap catatan hasil (gejala/kamera) membawa satu baris metadata kecil `Tanggal - Status` dengan titik status fungsional yang menandai keadaan nyata (tercatat, perlu perhatian). Titik hanya muncul bila ada status nyata.
- Label data admin memakai format monospace hanya untuk NIK dan ID (data teknis), bukan estetika terminal.

## Ikon

- Satu set inline SVG stroke 24px yang digambar khusus (home, kamera, riwayat, profil, pengguna, ringkasan, keluar, peringatan, info, tutup, tambah, unduh, ulang). Alasan: relevansi per fungsi dan beban render kecil; tidak memakai library generik penuh (R-04).

## Konten

- Semua angka berasal dari API (R-17). Field kosong dibiarkan kosong dengan placeholder jujur (R-23, R-38).
- Tidak ada testimoni, FAQ, atau klaim keamanan (R-18, R-28, R-36).
- Disclaimer medis ditampilkan di tempat hasil ditampilkan, satu kalimat, sesuai permintaan pemilik.
