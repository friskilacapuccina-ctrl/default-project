# Database & Role-Based Access Control (RBAC) — BioLearn AI

Dokumen ini menjelaskan desain database, autentikasi, hak akses per role, cara
menjalankan migrasi/seed, dan cara menguji sistem.

## 1. Database yang digunakan

**PostgreSQL (Neon)** via **Prisma ORM**.

Alasan:
- Project sudah memakai Prisma + PostgreSQL sejak awal (migrasi `20261005060000_init`),
  sehingga tidak perlu mengganti stack.
- PostgreSQL mendukung foreign key, unique constraint, indeks, transaksi, dan `JSON`
  yang dibutuhkan untuk audit log.
- Neon menyediakan koneksi pooling + direct URL (dipakai Prisma migrate).

Konfigurasi ada di `.env` (lihat `.env.example`):
- `DATABASE_URL` — koneksi pooling untuk aplikasi.
- `DIRECT_URL` — koneksi langsung untuk `prisma migrate`.
- `AUTH_SECRET` — rahasia penandatangan JWT session (minimal 32 karakter).
- `SEED_ADMIN_PASSWORD` — (opsional, produksi) password admin saat seed.
- `SEED_PASSWORD` — (opsional) password akun demo lain saat seed.

## 2. Tabel dan relasi

| Tabel | Fungsi | Relasi |
|---|---|---|
| `User` | Identitas & kredensial (password bcrypt, **tidak pernah plaintext**). Kolom `role` (ADMIN/TEACHER/STUDENT), `isActive`, `tokenVersion` (pencabut sesi). | induk dari hampir semua tabel |
| `TeacherProfile` | Kode guru, subject, bio. Dibuat otomatis saat akun guru dibuat. | 1-1 `User` |
| `StudentProfile` | Kode siswa, kelas, tanggal daftar. Dibuat otomatis saat registrasi/admin. | 1-1 `User` |
| `Course` | Kelas (mis. X MIPA 1, X MIPA 2). | — |
| `CourseTeacher` | Penetapan guru ke kelas (unique `courseId+teacherId`). | many-1 `Course`, many-1 `User` |
| `CourseStudent` | Enrollment siswa (unique `courseId+studentId` — anti duplikat). | many-1 `Course`, many-1 `User` |
| `Material` | 6 materi Biologi (konten, slug unik, file, published). | 1-many `Video`, `Progress` |
| `Video` | Video pembelajaran per materi. | many-1 `Material` |
| `VideoProgress` | Menonton video (unique per user+video). | many-1 `User`, `Video` |
| `Pretest`/`Posttest` | Container tes. | 1-many soal & attempt |
| `PretestQuestion`/`PosttestQuestion` | Bank soal versi tes (teks, penjelasan, urutan). Seed awal berisi 25 soal. | many-1 tes |
| `PretestOption`/`PosttestOption` | Opsi jawaban; **hanya server** yang membaca `isCorrect`. | many-1 soal |
| `PretestAttempt`/`PosttestAttempt` | Hasil per attempt: skor, jumlah benar, waktu. | many-1 `User`, tes; 1-many jawaban |
| `PretestAnswer`/`PosttestAnswer` | Jawaban per soal + `isCorrect` (diisi server). | many-1 attempt, soal |
| `Progress` | Kemajuan materi (unique per user+material). | many-1 `User`, `Material` |
| `AIConversation`/`AIMessage` | Percakapan AI Tutor (kepemilikan per user). | many-1 `User` |
| `ManualBook` | Buku petunjuk. | — |
| `AuditLog` | Log aktivitas administratif (USER_CREATE/USER_UPDATE/TEACHER_ASSIGN/STUDENT_ENROLL/MATERIAL_PUBLISH). **Tanpa password/token.** | many-1 `User` (actor, nullable) |

## 3. Migrasi dan seed

```bash
npm install
npx prisma migrate dev        # buat/terapkan migrasi (dev)
npx prisma migrate deploy     # terapkan migrasi (produksi)
npx prisma migrate status     # cek status
npm run db:seed               # seed idempoten (aman dijalankan ulang)
npm run db:studio             # inspeksi data
```

Catatan seed:
- Idempoten: user/course/materi memakai `upsert`; soal hanya dibuat ulang bila
  jumlahnya belum 25, sehingga **attempt siswa tidak pernah dihapus** saat reseed.
- Data demo: 1 admin, 3 guru (`teacher01..03`), 20 siswa dengan nama dan username khusus,
  2 kelas (guru01+02 → X MIPA 1; guru03 → X MIPA 2), 6 materi, 25 pretest + 25 posttest.
- **Guard produksi**: di `NODE_ENV=production`, akun demo hanya dibuat bila
  `SEED_ADMIN_PASSWORD` di-set; jika tidak, seed melewati akun demo
  (materi & soal tetap diseed).

## 4. Membuat akun admin & guru dengan aman

- **Pengembangan lokal**: akun demo dari seed (`admin` / `teacher01..03` /
  20 akun siswa). Guru/admin memakai password default `Biolearn123` (guru dapat
  diubah lewat `SEED_PASSWORD`); setiap siswa memiliki password awal berbeda.
  Daftar nama, username, email, dan password siswa ada di
  [`akun-demo-siswa.csv`](akun-demo-siswa.csv).
- **Produksi**:
  1. Set `SEED_ADMIN_PASSWORD` (password kuat) lalu `npm run db:seed`,
     atau
  2. Buat akun admin lewat script/CLI sekali jalan di lingkungan tepercaya,
     atau
  3. Daftarkan akun pertama sebagai siswa lalu ubah role-nya dari DB
     (`UPDATE "User" SET role='ADMIN' WHERE username='...'`) pada awal setup.
- Akun **guru** hanya bisa dibuat oleh admin terautentikasi
  (`POST /api/admin/users`) — registrasi publik selalu ber-role `STUDENT`
  (field `role` dari body diabaikan total).

## 5. Menguji tiga role

Jalankan aplikasi (`npm run dev`), lalu masuk dengan:

| Role | Username | Password | Landing page |
|---|---|---|---|
| Siswa | lihat daftar `akun-demo-siswa.csv` | password berbeda per akun | `/dashboard` |
| Friskila Uliana | `teacher01` | `Biolearn123` | `/teacher` |
| Anzalina Viena Rahmatika | `teacher02` | `Biolearn123` | `/teacher` |
| Nathasya Febriani | `teacher03` | `Biolearn123` | `/teacher` |
| Admin | `admin` | `Biolearn123` | `/admin` |

- Guru 01/02 hanya melihat siswa kelas X MIPA 1; guru 03 hanya X MIPA 2.
- Menukar role: login sebagai admin → **Manajemen Users** → ubah select role
  (sesi pengguna target langsung dicabut; tercatat di `AuditLog`).
- Nonaktifkan akun: tombol **Nonaktifkan** di halaman yang sama — login akan
  ditolak dan sesi aktif mati.

## 6. Model keamanan sesi

- Session = JWT (`biolearn_session`, HttpOnly, SameSite=Lax, Secure di produksi)
  berumur 7 hari yang membawa `userId`, `role`, dan `tokenVersion`.
- **Otorisasi selalu membaca database**: `requireUser`/`requireApi` di
  `src/lib/auth.ts` memverifikasi signature JWT → `tokenVersion` cocok dengan DB →
  `isActive` → role dari DB (bukan klaim JWT).
- Saat admin mengubah role/menonaktifkan akun, `tokenVersion` dinaikkan sehingga
  **seluruh sesi lama pengguna target langsung tidak berlaku**.

## 7. Endpoint yang dilindungi

Semua endpoint di bawah memverifikasi sesi + role di server:

| Endpoint | Akses |
|---|---|
| `POST /api/auth/register` | publik — selalu `STUDENT` |
| `POST /api/auth/login` | publik — rate limit 5/menit per IP+username, tolak akun nonaktif |
| `POST /api/auth/logout` | login |
| `GET/PATCH /api/profile` | login (milik sendiri) |
| `GET /api/admin/users` | ADMIN |
| `POST /api/admin/users` | ADMIN (buat akun semua role) |
| `PATCH /api/admin/users` | ADMIN (ubah role/isActive; audit + cabut sesi; larang ubah diri sendiri & admin terakhir) |
| `PATCH /api/admin/materials` | ADMIN |
| `POST /api/enrollment/teacher` | ADMIN (target wajib role TEACHER) |
| `POST /api/enrollment/student` | ADMIN, atau TEACHER yang ditugaskan ke kelas itu |
| `GET /api/pretest/questions`, `POST /api/pretest/submit` | STUDENT (penilaian server-side) |
| `GET /api/posttest/questions`, `POST /api/posttest/submit` | STUDENT (penilaian server-side) |
| `POST /api/progress/complete` | login (hanya untuk diri sendiri) |
| `POST /api/video/complete` | login (hanya untuk diri sendiri) |
| `POST /api/ai/chat` | login (kepemilikan percakapan dicek; 15 pesan/5 menit) |

Proteksi halaman: `src/middleware.ts` (redirect `/admin` & `/teacher` berdasar
role klaim) + pengecekan role final di tiap route handler dan server component
(`AppShell allow=[...]`).

## 8. Pengujian

```bash
npm test          # menjalankan tests/api.test.ts (menyalakan server dev port 3999 otomatis)
```

19 skenario mencakup: registrasi, duplikasi username, hash password, login
benar/salah, endpoint privat tanpa login, siswa vs endpoint admin, kepemilikan
attempt antar siswa, isolasi kelas guru, guru vs role admin, perubahan role via
request, kelola pengguna + pencabutan sesi + audit, penyimpanan hasil tes,
progress, enrollment anti-duplikat, dashboard dari data DB, migrasi/seed, aplikasi
tetap berfungsi, dan rate limit login.

Variabel opsional: `TEST_BASE_URL=http://localhost:3100 npm test` untuk menguji
server yang sudah berjalan (tanpa spawn otomatis).

## 9. Keterbatasan

- Rate limiter berbasis memori (single-instance). Untuk deployment multi-instance
  gunakan Redis.
- `AuditLog` mencatat perubahan administratif utama; perubahan minor (mis. edit
  nama profil sendiri) tidak diaudit agar log tetap ringkas.
- Enkripsi data at-rest & TLS disediakan platform (Neon); tidak ada mekanisme
  kripto tambahan di aplikasi.
- Pengaturan `Secure` cookie otomatis mengikuti `NODE_ENV`; di belakang proxy
  HTTPS tambahkan header `X-Forwarded-Proto` yang benar.
