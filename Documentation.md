# Documentation API — Huawei ICT Backend

Backend FastAPI untuk pencatatan gejala kesehatan dengan deteksi kamera.

- **Base URL:** `http://localhost:8000`
- **Prefix API:** `/api`
- **Swagger UI (interaktif):** http://localhost:8000/docs
- **OpenAPI JSON:** http://localhost:8000/openapi.json

## Autentikasi

Menggunakan **JWT Bearer Token**. Setiap request ke endpoint terproteksi harus
menyertakan header:

```
Authorization: Bearer <access_token>
```

Token didapat dari `POST /api/auth/login`, berlaku 120 menit (bisa diubah di `.env`).

## Aturan Role

| Role | id_Role | Hak akses |
| :--- | :--- | :--- |
| **Admin** | `R1` | Melihat history/data **seluruh user**, bisa filter per NIK, mengakses daftar user |
| **User** | `R2` | Hanya dapat melihat **riwayat miliknya sendiri** (berdasarkan NIK di token) |

Aturan ini diterapkan otomatis di server: user biasa yang mencoba mengakses data
orang lain mendapat **403 Forbidden**, dan tanpa/with invalid token mendapat **401**.

## Menjalankan

```bash
# 1. aktifkan venv
.venv\Scripts\activate        # Windows

# 2. pastikan MySQL (Laragon) jalan, database db_huawei tersedia

# 3. jalankan server
uvicorn app.main:app --port 8000
```

Saat pertama kali start, aplikasi otomatis membuat tabel sesuai ERD
(`Role`, `Users`, `Gejala`, `Camera`, `Status`) + seed:
- Role `R1`=Admin, `R2`=User
- Akun admin default: **NIK `admin` / password `admin123`** (segera ganti untuk production)

---

## Endpoint

### Meta

#### `GET /`
Health check.

```json
{ "status": "ok", "app": "Huawei ICT Backend" }
```

---

### Auth

#### `POST /api/auth/register` — daftar akun baru
Body:

```json
{
  "NIK": "3201234567890001",
  "Name": "Bagas Pratama",
  "Tgl_lahir": "2003-05-17",
  "Alamat": "Jl. Merdeka No. 10, Bandung",
  "id_Role": "R2",
  "password": "rahasia123"
}
```

Respons **201**:

```json
{
  "NIK": "3201234567890001",
  "Name": "Bagas Pratama",
  "Tgl_lahir": "2003-05-17",
  "Alamat": "Jl. Merdeka No. 10, Bandung",
  "id_Role": "R2",
  "role_name": "User"
}
```

Error: `409` NIK sudah terdaftar · `400` id_Role tidak valid.
Password di-hash **bcrypt** sebelum disimpan.

#### `POST /api/auth/login` — login, dapat token
Body:

```json
{ "NIK": "3201234567890001", "password": "rahasia123" }
```

Respons **200**:

```json
{ "access_token": "eyJhbGciOi...", "token_type": "bearer" }
```

Error: `401` NIK atau password salah.

#### `GET /api/auth/me` — profil user yang sedang login *(Bearer)*
Respons **200**:

```json
{
  "NIK": "3201234567890001",
  "Name": "Bagas Pratama",
  "Tgl_lahir": "2003-05-17",
  "Alamat": "Jl. Merdeka No. 10, Bandung",
  "id_Role": "R2",
  "role_name": "User"
}
```

---

### Users

#### `GET /api/users` — daftar semua user *(khusus Admin)*
Respons **200**: array objek user (sama seperti `/auth/me`).

Error: `403` Akses khusus Admin.

#### `GET /api/users/me` — profil sendiri *(Bearer)*

#### `GET /api/users/{nik}` — detail user *(Bearer)*
- Admin: boleh lihat semua NIK.
- User biasa: hanya NIK sendiri, selain itu **403** · **404** bila tidak ada.

---

### Gejala (riwayat pencatatan)

#### `POST /api/gejala` — catat gejala baru *(Bearer)*
Gejala dicatat atas NIK user yang sedang login. `id_gejala` dibuat otomatis,
`Tanggal` otomatis (waktu server).

Body:

```json
{ "Suhu": 38.2, "Batuk": "kering" }
```

Respons **201**:

```json
{
  "id_gejala": "ee52c46cf5d441a7a21f",
  "NIK": "3201234567890001",
  "Batuk": "kering",
  "Suhu": 38.2,
  "Tanggal": "2026-10-18T18:11:25"
}
```

Validasi: `Suhu` 30–45 · `Batuk` maks 20 karakter.

#### `GET /api/gejala/history` — riwayat gejala *(Bearer)* ⭐ endpoint utama
Mengembalikan riwayat gabungan: gejala + hasil deteksi kamera + laporan.

- **User biasa** → otomatis hanya riwayat miliknya sendiri.
- **Admin** → riwayat **semua user**; opsional filter `?nik=<NIK>`.

Query params:

| Param | Tipe | Keterangan |
| :--- | :--- | :--- |
| `limit` | int (1–200, default 50) | jumlah maksimum catatan |
| `nik` | string | filter NIK (dipakai Admin; user biasa hanya boleh NIK sendiri) |

Respons **200** (contoh):

```json
[
  {
    "id_gejala": "ee52c46cf5d441a7a21f",
    "NIK": "3201234567890001",
    "nama_user": "Bagas Pratama",
    "Batuk": "kering",
    "Suhu": 38.2,
    "Tanggal": "2026-10-18T18:11:25",
    "cameras": [
      {
        "id_cam": "02f7a0b1c77644a7b217",
        "Status": "terdeteksi mengantuk",
        "Tanggal": "2026-10-18T18:11:47",
        "reports": [ { "id_rept": "..." } ]
      }
    ]
  }
]
```

Error: `403` user biasa memaksa `?nik=` milik orang lain.

#### `GET /api/gejala/{id_gejala}` — detail satu gejala *(Bearer)*
Struktur respons sama dengan item history di atas.
Admin: semua · User: miliknya saja (`403`/`404` bila melanggar).

---

### Camera (hasil deteksi)

#### `POST /api/camera` — rekam hasil deteksi kamera *(Bearer)*
Body:

```json
{ "Status": "terdeteksi mengantuk", "id_gejala": "ee52c46cf5d441a7a21f" }
```

Respons **201**:

```json
{
  "id_cam": "02f7a0b1c77644a7b217",
  "Status": "terdeteksi mengantuk",
  "id_gejala": "ee52c46cf5d441a7a21f",
  "Tanggal": "2026-10-18T18:11:47"
}
```

User hanya boleh merekam pada gejala miliknya; Admin pada semua.
Error: `404` id_gejala tidak ditemukan · `403` bukan milik Anda.

#### `GET /api/camera` — daftar rekaman kamera *(Bearer)*
Admin: semua · User: hanya rekaman pada gejala miliknya. Query `limit` sama seperti history.

---

## Ringkasan Kode Status

| Kode | Arti |
| :--- | :--- |
| 200 | Sukses |
| 201 | Data berhasil dibuat |
| 401 | Token tidak ada / tidak valid / kedaluwarsa |
| 403 | Token valid, tapi bukan Admin / mencoba akses data user lain |
| 404 | Data tidak ditemukan |
| 409 | NIK sudah terdaftar (register) |
| 422 | Body/parameter tidak sesuai skema |

## Struktur Proyek

```
Backend/
├── app/
│   ├── main.py              # entry FastAPI + auto create table + seed
│   ├── core/
│   │   ├── config.py        # konfigurasi (.env)
│   │   └── security.py      # JWT, bcrypt, dependency role Admin/User
│   ├── db/session.py        # engine SQLAlchemy + SessionLocal
│   ├── models/gejala.py     # model ORM: Role, Users, Gejala, Camera, Status
│   ├── schemas/main.py      # skema Pydantic (request/response)
│   └── routers/
│       ├── auth.py          # register, login, me
│       ├── users.py         # list/detail user (Admin)
│       └── gejala.py        # gejala, history, camera
├── .env                     # DATABASE_URL, SECRET_KEY (jangan di-commit)
├── requirements.txt
└── Documentation.md
```

## Catatan Teknis

- Database mengikuti `dokumentasi_database_erd.md`; kolom tambahan `password`
  (VARCHAR 255, bcrypt) ditambahkan pada tabel `Users` untuk autentikasi.
- ORM SQLAlchemy 2.0, driver PyMySQL, sesi database per-request via dependency.
- Password tidak pernah dikirim balik di respons apa pun.
