# MeaslesCare Web

Frontend untuk backend Huawei ICT (deteksi gejala campak). React + TypeScript + Vite + Tailwind 4 + React Router 7 + TanStack Query 5.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
```

Dev server mem-proxy `/be-api/*` ke `http://localhost:8000` (bisa diganti lewat env `VITE_PROXY_TARGET`).

Backend: jalankan `docker compose up -d` di `../backend-measlescare` atau `uvicorn app.main:app --port 8000`.

## Build produksi

```bash
npm run build      # tsc -b && vite build, hasil di dist/
npm run preview
```

## Environment variable

| Variabel | Wajib | Arti |
|---|---|---|
| `VITE_API_BASE_URL` | tidak | Alamat backend (contoh: `https://host` atau `https://host/api` — `/api` ditambahkan otomatis bila belum ada). Kosong = pakai proxy dev `/be-api`. |
| `VITE_PROXY_TARGET` | tidak | Target proxy dev; default `http://localhost:8000`. |

Catatan penting: backend yang berjalan di `https://ramirosservers.tail2d4b04.ts.net` menyajikan route **dengan** prefix `/api` (terverifikasi: `POST /api/auth/login`). `src/api/client.ts` otomatis menambahkan prefix `/api` pada `VITE_API_BASE_URL` bila belum ada, dan mengirim `Authorization: Bearer <token>` untuk endpoint terproteksi.

## Pengujian

Butuh dev server aktif dan backend hidup; akun uji: admin `admin`/`admin123`, user uji `3201234567890099`/`rahasia123` (dibuat saat smoke pertama).

```bash
node scripts/smoke-ui.mjs http://localhost:5173     # alur user: 11 pemeriksaan
node scripts/smoke-admin.mjs http://localhost:5173  # alur admin: 6 pemeriksaan
node scripts/smoke-camera.mjs http://localhost:5173 # alur kamera (fake media device): 7 pemeriksaan
node scripts/smoke-states.mjs http://localhost:5173 # state kosong/error/loading + responsif 6 lebar x 9 halaman
python3 audit/contrast.py                           # kontras WCAG token tema
```

## Struktur

```
src/
├── api/            # client terpusat (fetch, token, error) + fungsi per endpoint + tipe
├── auth/           # AuthProvider, guard sesi, isAdmin
├── components/     # ui, layout, kamera, kartu status
├── hooks/          # useCameraCapture (getUserMedia, snap, ganti kamera)
├── lib/            # format tanggal/suhu, cn, pemetaan status kamera
├── pages/          # halaman user + admin/
└── routes/         # guard role
```

## Cakupan endpoint

| Endpoint | Halaman/komponen pemakai |
|---|---|
| `GET /` (health) | tidak dipakai UI (endpoint monitoring; memanggilnya dari UI tidak memberi nilai bagi pengguna) |
| `POST /api/auth/register` | RegisterPage |
| `POST /api/auth/login` | LoginPage |
| `GET /api/auth/me` | AuthProvider (pemulihan sesi), dipakai seluruh halaman terproteksi |
| `GET /api/users` | AdminUsersPage, AdminDashboardPage (jumlah pengguna) |
| `GET /api/users/me` | ProfilePage |
| `GET /api/users/{nik}` | AdminUserDetailPage |
| `POST /api/gejala` | CheckupPage |
| `GET /api/gejala/history` | HomePage (terakhir), HistoryPage, AdminDashboardPage, AdminRecordsPage, AdminUserDetailPage (filter `?nik=`) |
| `GET /api/gejala/{id_gejala}` | ResultPage (user + admin) |
| `POST /api/camera` | ResultPage (rekam hasil deteksi) |
| `GET /api/camera` | HistoryPage (bagian "Rekaman kamera terbaru") |

## Ambiguitas terbuka

- Tidak ada endpoint unggah gambar di `Documentation.md`; foto kamera hanya pratinjau lokal, hasil deteksi dicatat lewat `POST /camera`. Lihat `// TODO(api)` di `src/pages/CheckupPage.tsx`.
- Fitur hapus pengguna dari admin menunggu endpoint `DELETE` di backend (belum ada di `Documentation.md`, OpenAPI, maupun kode backend). Lihat `// TODO(api)` di `src/pages/admin/AdminUsersPage.tsx`.
- Tidak ada endpoint ubah profil, jadi tidak ada aksi ubah data akun di UI.
