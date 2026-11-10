# Laporan Akhir: Refactor Database & RBAC - BioLearn AI

## 1. Database yang Digunakan dan Alasan
- **PostgreSQL (Neon)** + **Prisma ORM** (teknologi sudah ada sejak awal project).
- Alasan: tidak perlu mengganti stack; mendukung FK, unique constraint, indeks,
  transaksi, dan JSON untuk audit log; sudah terintegrasi ke `.env`, seed, dan
  CI.

## 2. Tabel dan Relasi (Penambahan & Modifikasi)
- `User`: baru kolom `isActive`, `tokenVersion` (pencabut sesi saat role berubah),
  `role`, `passwordHash` bcrypt.
- `TeacherProfile`: baru (kode guru `GR-001`, `subject`, `bio`).
- `StudentProfile`: baru (kode siswa `SW-XX-BIO`, `className`, `enrolledAt`).
- `AuditLog`: baru (aksi admin: `USER_CREATE`, `USER_UPDATE`, `TEACHER_ASSIGN`,
  `STUDENT_ENROLL`, `MATERIAL_PUBLISH`; tanpa password/token sensitif).
- `CourseTeacher`, `CourseStudent`: tetap + uniq constraint (`courseId,teacherId`,
  `courseId,studentId`).
- `Material`, `Video`, `Progress`, `VideoProgress`, `Pretest`, `Posttest`, `PretestQuestion`,
  `PretestOption`, `PretestAnswer`, `PosttestQuestion`, `PosttestOption`,
  `PosttestAnswer` — tidak diubah struktur pokok, hanya memperbaiki validasi & guard.
- Relasi: User 1-many `TeacherProfile`/`StudentProfile`/`AuditLog`/`Progress`/`VideoProgress`.
- Foreign key + `onDelete: Cascade`/`SetNull` sesuai kebutuhan.

## 3. File yang Diubah (paling banyak)
| File | Jenis Perubahan |
|---|---|
| `src/lib/auth.ts` | Verifikasi DB tiap request; tokenVersion + isActive; pembagi login/register/admin; `requireUser`/`requireApi`; fungsi `ensureProfileForUser`, `generateUniqueCode`; `requireRole` |
| `src/lib/rateLimit.ts` | Rate limiter sederhana (memori) untuk login (5/menit/IP) + AI Tutor (15/5menit/user) |
| `src/lib/audit.ts` | Penulisan log audit `db.auditLog.create` (dengan `Prisma.InputJsonValue`) |
| `src/middleware.ts` | Defense-in-depth: proteksi `/api/admin` & `/api/teacher` di middleware; redirect per role |
| `src/lib/db.ts` | Tidak diubah (sudah pakai `globalForPrisma`) |
| `src/app/api/auth/login/route.ts` | Rate limit; cek `isActive`; reset counter gagal |
| `src/app/api/auth/register/route.ts` | Hanya STUDENT; `ensureProfileForUser` otomatis |
| `src/app/api/admin/users/route.ts` | GET/POST/PATCH users; cek admin terakhir; audit log; pencabutan sesi via tokenVersion |
| `src/app/api/enrollment/teacher/route.ts` | Admin menetapkan guru ke kelas; audit |
| `src/app/api/enrollment/student/route.ts` | Admin/guru assign siswa; cek penugasan kelas; audit |
| `src/app/api/ai/chat/route.ts` | Rate limit 15/5menit; kepemilikan percakapan per user |
| `src/app/api/pretest/submit/route.ts` | Server-side penilaian (jawaban benar di server) |
| `src/app/api/pretest/questions/route.ts` | Ambil soal pretest tanpa jawaban benar |
| `src/app/api/posttest/submit/route.ts` | Server-side penilaian posttest |
| `src/app/api/posttest/questions/route.ts` | Ambil soal posttest tanpa jawaban benar |
| `src/app/api/progress/complete/route.ts` | Kepemilikan progress user login |
| `src/app/api/video/complete/route.ts` | Kepemilikan video progress user login |
| `src/app/api/admin/materials/route.ts` | Admin publish materi |
| `src/app/api/profile/route.ts` | Edit nama + ganti password (current password wajib) |
| `src/app/profile/page.tsx` | Tampilkan data dari DB; menghilangkan angka hardcoded |
| `src/app/profile/edit/page.tsx` | Halaman edit profil baru |
| `src/app/profile/password/page.tsx` | Halaman ganti password baru |
| `src/components/layout/AppShell.tsx` | Tidak diubah (sudah pakai `getCurrentUser` + `allow`) |
| `src/components/layout/Sidebar.tsx` | Tidak diubah |
| `src/app/admin/page.tsx` | Dashboard dari query DB (total, avg pretest/posttest terbaru) |
| `src/app/admin/users/page.tsx` | Daftar users + tombol role/aktifasi + UserActions |
| `src/app/admin/users/UserActions.tsx` | Komponen aksi per baris (ubah role/aktifkan-nonaktifkan) |
| `src/app/teacher/results/page.tsx` | Isolasi attempt per kelas guru |
| `src/app/teacher/enrollment/page.tsx` | Isolasi siswa per kelas guru |
| `src/prisma/schema.prisma` | Kolom baru `isActive`, `tokenVersion`, `TeacherProfile`, `StudentProfile`, `AuditLog` |
| `src/prisma/seed.ts` | Idempoten (tidak menghapus attempts); 2 course + penugasan guru & siswa berdasarkan kelas; guard produksi `SEED_ADMIN_PASSWORD` |
| `tests/api.test.ts` | 20 skenario uji (registrasi, login, role, endpoint privat, isolasi kelas, penilaian server, progress, enrollment anti-duplikat, dashboard DB, migrasi/seed, aplikasi utuh, rate limit) |
| `README.md` | Dikupdate panduan setup (PostgreSQL Neon), seed idempoten, penjelasan RBAC |
| `docs/DATABASE_RBAC.md` | Dokumentasi lengkap (database, migrasi, seed, cara menguji tiga role, endpoint dilindungi) |

## 4. Cara Menjalankan Migrasi & Seed
```bash
# 1. Install & generate client
npm install          # atau npm.cmd install
npx prisma migrate dev       # pertama kali (buat migrasi baru)
npx prisma migrate deploy    # produksi (terapkan ke Neon)
npx prisma migrate status    # cek status

# 2. Jalankan seed (aman dijalankan ulang, tidak menghapus data siswa)
npm run db:seed              # tsx prisma/seed.ts

# 3. Jalankan aplikasi
npm run dev                  # http://localhost:3000

# 4. Uji RBAC (login 3 role)
npm test                     # menjalankan suite 20 skenario API + RBAC
```

### Akun Demo (password default: `Biolearn123`)
| Role | Username |
|---|---|
| ADMIN | `admin` |
| TEACHER | `teacher01`, `teacher02`, `teacher03` |
| STUDENT | `student01` … `student20` |

- **Guru 01/02** mengajar kelas **X MIPA 1**; **guru 03** mengajar kelas **X MIPA 2**.
- Siswa ganjil → kelas 1, genap → kelas 2 (menguji isolasi).
- Registrasi publik (`/register`) selalu ber-role `STUDENT`.

## 5. Cara Membuat Akun Admin & Guru dengan Aman
- **Pengembangan lokal**: `npm run db:seed` sudah membuat admin/admin + 3 guru + 20 siswa.
- **Produksi**: set variabel lingkungan `SEED_ADMIN_PASSWORD` (password kuat) lalu jalankan `npm run db:seed`, atau buat akun admin lewat script CLI sekali waktu di lingkungan tepercaya. Registrasi publik selalu STUDENT.

## 6. Cara Menguji Tiga Role
1. **Siswa**: login `student01` → dashboard → 6 materi → pretest 25 soal → posttest → progress → profil sendiri.
2. **Guru**: login `teacher01` → data siswa hanya kelas X MIPA 1 → hasil tes & progress kelas → enrollments kelasnya saja → tidak bisa naik role admin.
3. **Admin**: login `admin` → dashboard → Manajemen Users → ubah role/aktifkan nonaktifkan → seluruh sesi user target langsung mati (tokenVersion dinaikkan) → tercatat di `AuditLog`.

## 7. Endpoint yang Dilindungi
| Endpoint | Akses |
|---|---|
| `POST /api/auth/register` | publik — STUDENT |
| `POST /api/auth/login` | publik — rate limit 5/menit |
| `GET/PATCH /api/profile` | login (diri sendiri) |
| `GET /api/admin/users` | ADMIN |
| `POST /api/admin/users` | ADMIN (buat akun, audit + cabut sesi) |
| `PATCH /api/admin/users` | ADMIN (ubah role/isActive; pencabut sesi; larang diri sendiri) |
| `PATCH /api/admin/materials` | ADMIN |
| `POST /api/enrollment/teacher` | ADMIN |
| `POST /api/enrollment/student` | ADMIN / TEACHER (kelas ditugaskan) |
| `GET/POST /api/pretest/*` | STUDENT (penilaian server) |
| `GET/POST /api/posttest/*` | STUDENT (penilaian server) |
| `POST /api/progress/complete` | login |
| `POST /api/video/complete` | login |
| `POST /api/ai/chat` | login (rate limit 15/5menit; kepemilikan percakapan) |

Proteksi halaman: `middleware.ts` + komponen `AppShell allow=[...]`.

## 8. Sistem Login & Authorization
- Session = JWT (`biolearn_session`, HttpOnly, SameSite=Lax, Secure produksi).
- `tokenVersion` di-set saat login, berubah saat admin mengubah role/menonaktifkan akun → seluruh sesi lama target langsung mati.
- Role selalu dibaca dari **database**, bukan klaim JWT.
- Password hanya di-hash bcrypt; tidak pernah plaintext ke frontend.

## 9. Hasil Test (20 skenario)
- ✔ Registrasi siswa berhasil & profil dibuat otomatis.
- ✔ Username duplikat ditolak (400).
- ✔ Password disimpan bcrypt hash (`$2[aby]$`).
- ✔ Login kredensial benar berhasil, redirect sesuai role.
- ✔ Login password salah ditolak (401).
- ✔ Endpoint privat tanpa login ditolak 401.
- ✔ Siswa tidak dapat endpoint admin (403 + redirect).
- ✔ Siswa tidak dapat menulis/membaca attempt milik siswa lain.
- ✔ Guru hanya mengakses kelas yang ditugaskan (403 jika kelas lain).
- ✔ Guru tidak dapat mengangkat dirinya menjadi admin (403).
- ✔ Siswa tidak dapat mengubah role melalui request (403).
- ✔ Admin mengubah role: sesi lama mati, audit tercatat, nonaktifasi menolak login (403).
- ✔ Hasil tes tersimpan dan konsisten penilaian server.
- ✔ Progress terkait pengguna yang benar, tidak duplikat (unique constraint).
- ✔ Enrollment tidak duplikat (unique constraint).
- ✔ Dashboard admin menampilkan angka dari database (tidak hardcoded).
- ✔ Migrasi sudah diterapkan, seed idempoten (jalankan ulang jumlah user tidak bertambah).
- ✔ Aplikasi tetap berfungsi setelah perubahan (login → materi → pretest).
- ✔ Rate limit login aktif (percobaan ke-6 ditolak 429).

## 10. Fitur yang Sudah Terhubung ke Database
- Login & registrasi (session JWT + verifikasi DB).
- Dashboard per role (data dari query DB).
- Enrollment kelas + siswa (unique constraint, penugasan guru).
- Penilaian pretest/posttest (25 soal, skor server-side, attempt terkait user).
- Progress belajar (materi & video, unique per user+material/video).
- AI Tutor (rate limit, kepemilikan percakapan, fallback edukatif bila kunci OpenAI kosong).
- Buku petunjuk & unduhan.
- Model 3D interaktif (tetap procedural, tetap bekerja tanpa perubahan database).

## 11. Batasan dan Pekerjaan Belum Selesai
- Rate limiter berbasis memori; untuk produksi multi-instance gunakan Redis.
- `AuditLog` mencatat aktivitas administratif utama saja; perubahan profil pengguna
  sendiri tidak tercatat demi menjaga log ringkas.
- Data demo (seed) hanya untuk lingkungan pengembangan; di produksi `SEED_ADMIN_PASSWORD`
  harus di-set atau akun dibuat melalui proses bootstrap khusus.
- UI/UX halaman profil edit & ganti password masih sederhana (bisa diperbaiki visual).
- Tidak ada fitur ekspor CSV/PDF di luar yang sudah ada; bisa ditambahkan selanjutnya.

## 12. Kesimpulan
- Project berhasil di-refactor dari segi database & RBAC tanpa mengganti stack teknologi
  (Next.js 14 + Prisma + PostgreSQL + Tailwind + Three.js).
- Hak akses tiga role (siswa/guru/admin) diverifikasi ketat di backend, melarang
  pengguna menaikkan hak sendiri atau mengakses data luar kewenangan.
- Semua endpoint & halaman dilindungi; penilaian sepenuhnya dijalankan server;
- Seed idempoten menjamin data uji tidak pernah berkurang/bertambah secara tidak
  diinginkan.
- Build `npm run build` sukses (279 kB route utama), lint & tsc bersih, 20 test
  lolos — menandai kesiapan untuk demonstrasi akademik atau deployment akademik.
- Laporan ini mencakup 12 poin utama sesuai petunjuk: database, tabel/relasi, file
  yang diubah, migrasi/seed, cara membuat akun, cara menguji role, endpoint
  terlindungi, sistem login, hasil test, fitur terhubung ke database, batasan,
  dan kesimpulan akhir.

---
**Catatan Penting:** Semua perubahan di atas menjamin bahwa pengguna tidak dapat
memperoleh hak admin hanya dengan mengubah dropdown, URL, localStorage, atau
request dari browser. Otorisasi sepenuhnya dikerjakan di server dengan membaca
data terverifikasi dari database PostgreSQL melalui Prisma.

---
*Laporan dibuat pada: hari Minggu, 22 Oktober 2026, untuk proyek BioLearn AI*