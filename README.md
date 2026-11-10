# BioLearn AI — Platform Pembelajaran Biologi SMA Berbasis AI

Project mata kuliah **Pengembangan Bahan Ajar** (Program Studi Pendidikan Teknologi Informasi).

Alur belajar: Login → Dashboard → Pretest → 6 Materi → Video → AI Tutor → Posttest → Hasil & Evaluasi → Progress.

## Fitur

- Auth aman (bcrypt + JWT httpOnly cookie), 3 role: ADMIN / TEACHER / STUDENT
- Dashboard siswa: statistik, progress, continue learning, rekomendasi, perbandingan pretest vs posttest, kartu AI Tutor
- Bank soal Pretest dan Posttest yang dapat dikelola guru; opsi diacak, penilaian tetap di server, dan `isCorrect` tidak pernah dikirim ke client
- 6 materi Biologi SMA + download PDF per materi
- 6 video (YouTube embed) + tandai selesai
- AI Tutor (chat, context-aware per materi, system prompt tutor SMA, fallback edukatif bila tanpa API key)
- Manual book + download PDF
- Enrollment: 1 course (Biologi SMA MIPA), 3 guru, 20 siswa
- Dashboard guru: data siswa, hasil, analytics (real DB)
- Dashboard admin: users, enrollment, materi, video, hasil, manual book, settings

## Tech Stack

Next.js 14 (App Router) • TypeScript strict • Tailwind CSS • Lucide • Prisma 5 • MySQL (siap Neon Postgres) • Zod • bcryptjs • jose (JWT) • OpenAI API • ESLint • Prettier

## Syarat

- Node.js 18+ (disarankan 20), npm
- Database MySQL lokal (XAMPP/Laragon) — migrasi Neon Postgres siap di `prisma/migrations-neon-backup/`

## Instalasi

```bash
npm.cmd install          # Windows (npm.ps1 sering diblokir ExecutionPolicy)
cp .env.example .env     # lalu isi DATABASE_URL, OPENAI_API_KEY, AUTH_SECRET
```

## Setup Database (PostgreSQL — Neon)

Project memakai **PostgreSQL (Neon)** + Prisma. Isi `.env` dari `.env.example`:

```
DATABASE_URL="postgresql://... (pooling Neon)"
DIRECT_URL="postgresql://... (direct Neon, untuk migrate)"
AUTH_SECRET="minimal-32-karakter-random-..."
```

> Migrasi lama MySQL masih tersimpan di `prisma/migrations-neon-backup/` sebagai arsip.

## Prisma

```bash
npx prisma migrate deploy  # menerapkan prisma/migrations ke Neon (pertama kali)
npx prisma db seed                   # seed otomatis via "prisma seed" (tsx prisma/seed.ts)
npx prisma studio                    # opsional: GUI database
```

Konfigurasi seed ada di `package.json` → `prisma.seed = "tsx prisma/seed.ts"`.

Seed **idempoten** (aman dijalankan ulang; tidak menghapus attempt siswa) dan membuat:
1 admin, 3 teacher (+profil guru), 20 student (+profil siswa), **2 course** dengan
penugasan guru & enrollment terbagi (guru01+02 → X MIPA 1; guru03 → X MIPA 2),
6 materi, 6 video, 25 pretest + 25 posttest (berbeda), 1 manual book.

## Menjalankan

```bash
npm run dev      # http://localhost:3000
npm run lint
npm run typecheck
npm test         # suite pengujian API + RBAC (tests/api.test.ts)
npm run build && npm start
```

## AI Setup

Isi `OPENAI_API_KEY` di `.env`. Key hanya dipakai di server (`src/lib/ai.ts`, route `/api/ai/chat`).
Tanpa key — atau jika OpenAI error/kuota habis — AI Tutor memakai **mode fallback edukatif** (jawaban per topik + arahan). Jangan pernah memakai `NEXT_PUBLIC_OPENAI_API_KEY`.

## Pemulihan Kata Sandi

Fitur **Lupa kata sandi?** mengirim tautan reset satu kali melalui Resend. Atur
`RESEND_API_KEY`, `MAIL_FROM` (alamat pengirim yang sudah diverifikasi di Resend),
dan `APP_URL` di `.env`. Tautan berlaku 30 menit; perubahan password mencabut
sesi lama. Terapkan migrasi database sebelum memakai fitur ini:

```bash
npx prisma migrate deploy
```

## Akun Demo

| Role | Username |
|---|---|
| ADMIN | `admin` |
| TEACHER | `teacher01`, `teacher02`, `teacher03` |
| STUDENT | Lihat daftar nama, username, email, dan password di [`docs/akun-demo-siswa.csv`](docs/akun-demo-siswa.csv) |

Akun demo guru/admin memakai password `Biolearn123` secara default. Setiap akun siswa demo memiliki password awal unik. Menjalankan seed kembali akan mengatur ulang password demo siswa sesuai daftar tersebut.

Registrasi publik (`/register`) hanya membuat STUDENT. Guru/admin dibuat admin via menu Users.

## Keamanan & RBAC

- Role (ADMIN/TEACHER/STUDENT) **diverifikasi backend dari database** pada setiap
  endpoint; klaim JWT tidak dipercaya sendirian dan `tokenVersion` mencabut sesi
  lama saat role berubah / akun dinonaktifkan.
- Guru hanya mengakses kelas yang ditugaskan; siswa hanya melihat data miliknya.
- Login dilindungi rate limit; AI Tutor dibatasi 15 pesan/5 menit.
- Perubahan role/aktifasi tercatat di tabel `AuditLog` (tanpa data sensitif).

Detail lengkap: [`docs/DATABASE_RBAC.md`](docs/DATABASE_RBAC.md).

## Struktur Folder

```
src/app/            # routes: (landing), login, register, dashboard, pretest, materi, video,
                    # ai-tutor, posttest, manual-book, progress, profile, teacher/*, admin/*, api/*
src/components/     # ui, layout (Sidebar/MobileNav/AppShell), quiz, ai
src/lib/            # db, auth, ai, validations, utils
prisma/             # schema.prisma, seed.ts
public/materials/   # PDF materi (placeholder, ganti dengan PDF asli)
public/manuals/     # PDF manual book (placeholder)
```

## Route

Publik: `/`, `/login`, `/register`. Siswa: `/dashboard /pretest /materi /materi/[slug] /video /ai-tutor /posttest /manual-book /progress /profile`. Guru: `/teacher /teacher/students /teacher/enrollment /teacher/results /teacher/analytics`. Admin: `/admin /admin/users /admin/enrollment /admin/materials /admin/videos /admin/results /admin/manual-book /admin/settings`. API: `/api/auth/* /api/pretest/* /api/posttest/* /api/progress/complete /api/video/complete /api/ai/chat /api/enrollment/* /api/admin/*`.

## Database

Lihat `prisma/schema.prisma`: User, Course, CourseTeacher, CourseStudent, Material, Video, VideoProgress, Pretest(+Question/Option/Attempt/Answer), Posttest(+...), Progress (unique user+material), AIConversation, AIMessage, ManualBook.

## Menambah PDF Materi / Manual Book

1. Letakkan file di `public/materials/<slug>.pdf` atau `public/manuals/manual-book-biolearn-ai.pdf`.
2. File placeholder yang ada saat ini hanya penanda agar link download tidak palsu/mati — ganti dengan PDF asli.
3. Metadata (fileName, fileUrl, fileType) tersimpan di DB (Material / ManualBook).

## Deployment

Set env di hosting (DATABASE_URL, OPENAI_API_KEY, AUTH_SECRET), jalankan `prisma migrate deploy`, seed sekali, lalu `npm run build && npm start`.
