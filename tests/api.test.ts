/**
 * Pengujian integrasi API + RBAC BioLearn AI.
 * Menjalankan server Next.js dev otomatis (port 3999) kecuali TEST_BASE_URL diset.
 * Berjalan dengan: npm test  (tsx --test tests/api.test.ts)
 *
 * Cakupan (mengikuti daftar pengujian tugas):
 *  1 Registrasi siswa, 2 username duplikat, 3 hash password, 4 login benar,
 *  5 login salah, 6 endpoint privat tanpa login, 7 siswa vs endpoint admin,
 *  8 kepemilikan attempt antar siswa, 9 isolasi kelas guru, 10 guru vs role admin,
 *  11 siswa vs perubahan role, 12 kelola pengguna admin + pencabutan sesi,
 *  13 penyimpanan hasil tes, 14 progress milik sendiri, 15 enrollment tanpa duplikat,
 *  16 dashboard dari data DB, 17 migrasi & seed, 18 aplikasi tetap berfungsi,
 *  + rate limit login.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, execSync } from "node:child_process";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.TEST_PORT ?? "3999";
const BASE = process.env.TEST_BASE_URL ?? `http://localhost:${PORT}`;
const EXTERNAL = !!process.env.TEST_BASE_URL;

const db = new PrismaClient();
let server: ReturnType<typeof spawn> | null = null;
const createdUsernames: string[] = [];

// ---------- helper HTTP dengan cookie jar sederhana ----------
type Jar = { cookie?: string };

async function api(
  jar: Jar,
  pathname: string,
  opts: { method?: string; body?: unknown } = {}
): Promise<{ status: number; data: any; headers: Headers }> {
  const res = await fetch(`${BASE}${pathname}`, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(jar.cookie ? { cookie: jar.cookie } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    redirect: "manual",
  });
  const sc = res.headers.get("set-cookie");
  if (sc) {
    const pair = sc.split(";")[0];
    jar.cookie = jar.cookie ? `${jar.cookie}; ${pair}` : pair;
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, data, headers: res.headers };
}

const rand = () => Math.random().toString(36).slice(2, 10);

async function login(jar: Jar, username: string, password: string) {
  return api(jar, "/api/auth/login", { method: "POST", body: { username, password } });
}

async function createUserAsAdmin(admin: Jar, role: "STUDENT" | "TEACHER" | "ADMIN", prefix = "tst") {
  const u = `${prefix}_${role.toLowerCase()}_${rand()}`;
  const res = await api(admin, "/api/admin/users", {
    method: "POST",
    body: { name: `Tes ${u}`, username: u, email: `${u}@test.local`, password: "Password123", role },
  });
  assert.equal(res.status, 200, `gagal membuat user ${role}: ${JSON.stringify(res.data)}`);
  createdUsernames.push(u);
  return u;
}

// ---------- lifecycle server ----------
before(async () => {
  if (EXTERNAL) return;
  server = spawn(process.execPath, [path.join(ROOT, "node_modules", "next", "dist", "bin", "next"), "dev", "--port", PORT], {
    cwd: ROOT,
    stdio: "ignore",
  });
  const deadline = Date.now() + 180_000;
  for (;;) {
    try {
      const r = await fetch(`${BASE}/login`, { redirect: "manual" });
      if (r.status < 500) break;
    } catch {
      /* belum siap */
    }
    if (Date.now() > deadline) throw new Error("Server dev tidak siap dalam 180 detik");
    await new Promise((r) => setTimeout(r, 1500));
  }
}, { timeout: 200_000 });

after(async () => {
  // Bersihkan data uji (relasi ber-cascade menghapus attempt/progress/pesan).
  if (createdUsernames.length) {
    await db.user.deleteMany({ where: { username: { in: createdUsernames } } });
  }
  await db.$disconnect();
  if (server && !EXTERNAL) {
    try {
      execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" });
    } catch {
      server.kill();
    }
  }
});

// ---------- 1-5: registrasi & login ----------
test("1. registrasi siswa berhasil & profil dibuat", async () => {
  const jar: Jar = {};
  const u = `tst_reg_${rand()}`;
  createdUsernames.push(u);
  const res = await api(jar, "/api/auth/register", {
    method: "POST",
    body: { name: "Siswa Tes", username: u, email: `${u}@test.local`, password: "Password123", confirmPassword: "Password123" },
  });
  assert.equal(res.status, 200);
  const user = await db.user.findUnique({ where: { username: u }, include: { studentProfile: true } });
  assert.ok(user);
  assert.equal(user!.role, "STUDENT");
  assert.equal(user!.isActive, true);
  assert.ok(user!.studentProfile, "profil siswa otomatis dibuat");
});

test("2. username duplikat ditolak", async () => {
  const jar: Jar = {};
  const u = `tst_dup_${rand()}`;
  createdUsernames.push(u);
  const body = { name: "Duplikat", username: u, email: `${u}@test.local`, password: "Password123", confirmPassword: "Password123" };
  assert.equal((await api(jar, "/api/auth/register", { method: "POST", body })).status, 200);
  const res2 = await api(jar, "/api/auth/register", { method: "POST", body: { ...body, email: `${u}_2@test.local` } });
  assert.equal(res2.status, 400);
});

test("3. password tidak disimpan plaintext (bcrypt hash)", async () => {
  const user = await db.user.findFirst({ where: { username: { startsWith: "tst_reg_" } } });
  assert.ok(user);
  assert.notEqual(user!.passwordHash, "Password123");
  assert.match(user!.passwordHash, /^\$2[aby]\$/);
});

test("4. login dengan kredensial benar berhasil", async () => {
  const jar: Jar = {};
  const res = await login(jar, "student01", "Biolearn123");
  assert.equal(res.status, 200);
  assert.equal(res.data.redirect, "/dashboard");
  assert.ok(jar.cookie?.includes("biolearn_session"), "cookie sesi diterbitkan");
});

test("5. login dengan password salah ditolak", async () => {
  const res = await login({}, "student01", "salah-banget");
  assert.equal(res.status, 401);
});

// ---------- 6-7: proteksi endpoint ----------
test("6. endpoint privat tanpa login ditolak 401", async () => {
  assert.equal((await api({}, "/api/admin/users")).status, 401);
  assert.equal((await api({}, "/api/pretest/questions")).status, 401);
  assert.equal((await api({}, "/api/profile", { method: "PATCH", body: { name: "X Y" } })).status, 401);
});

test("7. siswa tidak dapat mengakses endpoint admin", async () => {
  const jar: Jar = {};
  await login(jar, "student01", "Biolearn123");
  assert.equal((await api(jar, "/api/admin/users")).status, 403);
  assert.equal((await api(jar, "/api/admin/users", { method: "PATCH", body: { id: "x", role: "ADMIN" } })).status, 403);
  // Halaman admin juga dialihkan (middleware).
  const page = await fetch(`${BASE}/admin`, { headers: { cookie: jar.cookie! }, redirect: "manual" });
  assert.ok([302, 307].includes(page.status) && page.headers.get("location")?.includes("/dashboard"));
});

// ---------- 8: kepemilikan data tes ----------
test("8. siswa tidak dapat menulis/membaca attempt milik siswa lain", async () => {
  const admin: Jar = {};
  await login(admin, "admin", "Biolearn123");
  const victim = await createUserAsAdmin(admin, "STUDENT", "tst_victim");

  const attacker: Jar = {};
  await login(attacker, "student01", "Biolearn123");
  const qs = await api(attacker, "/api/pretest/questions");
  assert.equal(qs.status, 200);
  const questions: any[] = qs.data.questions;
  assert.equal(questions.length, 25);
  // Jawaban benar tidak pernah dikirim ke klien.
  assert.ok(!JSON.stringify(qs.data).includes("isCorrect"));

  const victimUser = await db.user.findUnique({ where: { username: victim } });
  const answers = questions.map((q) => ({ questionId: q.id, selectedOptionId: q.options[0].id }));
  const submit = await api(attacker, "/api/pretest/submit", {
    method: "POST",
    body: { answers, userId: victimUser!.id }, // percobaan injeksi kepemilikan
  });
  assert.equal(submit.status, 200);
  // Attempt tetap milik attacker (dari sesi), bukan victim.
  const attempt = await db.pretestAttempt.findUnique({ where: { id: submit.data.id }, include: { answers: true } });
  assert.equal(attempt!.userId, (await db.user.findUnique({ where: { username: "student01" } }))!.id);
  assert.equal(attempt!.answers.length, 25);
});

// ---------- 9-11: batas role ----------
test("9. guru hanya dapat mengakses kelas yang ditugaskan", async () => {
  const admin: Jar = {};
  await login(admin, "admin", "Biolearn123");
  const student = await createUserAsAdmin(admin, "STUDENT", "tst_enroll");

  const t3: Jar = {}; // teacher03 hanya mengajar course2 (seed)
  await login(t3, "teacher03", "Biolearn123");
  const studentId = (await db.user.findUnique({ where: { username: student } }))!.id;
  const denied = await api(t3, "/api/enrollment/student", {
    method: "POST",
    body: { courseId: "course-biologi-mipa", studentId }, // kelas guru lain
  });
  assert.equal(denied.status, 403);

  const t1: Jar = {}; // teacher01 mengajar course1
  await login(t1, "teacher01", "Biolearn123");
  const allowed = await api(t1, "/api/enrollment/student", {
    method: "POST",
    body: { courseId: "course-biologi-mipa", studentId },
  });
  assert.equal(allowed.status, 200);
});

test("10. guru tidak dapat mengangkat dirinya menjadi admin", async () => {
  const t1: Jar = {};
  await login(t1, "teacher01", "Biolearn123");
  const me = await db.user.findUnique({ where: { username: "teacher01" } });
  const res = await api(t1, "/api/admin/users", { method: "PATCH", body: { id: me!.id, role: "ADMIN" } });
  assert.equal(res.status, 403);
  assert.equal((await db.user.findUnique({ where: { username: "teacher01" } }))!.role, "TEACHER");
});

test("11. siswa tidak dapat mengubah role melalui request", async () => {
  const jar: Jar = {};
  // Registrasi menyertakan field role palsu — harus diabaikan total.
  const u = `tst_selfrole_${rand()}`;
  createdUsernames.push(u);
  await api(jar, "/api/auth/register", {
    method: "POST",
    body: { name: "Naik Kelas", username: u, email: `${u}@test.local`, password: "Password123", confirmPassword: "Password123", role: "ADMIN" },
  });
  assert.equal((await db.user.findUnique({ where: { username: u } }))!.role, "STUDENT");
  // PATCH role sendiri lewat API admin juga ditolak.
  const me = await db.user.findUnique({ where: { username: u } });
  const res = await api(jar, "/api/admin/users", { method: "PATCH", body: { id: me!.id, role: "ADMIN" } });
  assert.equal(res.status, 403);
});

// ---------- 12: admin kelola pengguna + pencabutan sesi + audit ----------
test("12. admin mengubah role: sesi lama mati, audit tercatat, nonaktifasi menolak login", async () => {
  const admin: Jar = {};
  await login(admin, "admin", "Biolearn123");
  const username = await createUserAsAdmin(admin, "STUDENT", "tst_role");
  const target = await db.user.findUnique({ where: { username } });

  // Sesi aktif milik target sebelum perubahan role.
  const sesiLama: Jar = {};
  assert.equal((await login(sesiLama, username, "Password123")).status, 200);
  assert.equal((await api(sesiLama, "/api/profile", { method: "PATCH", body: { name: "Nama Baru" } })).status, 200);

  const patch = await api(admin, "/api/admin/users", { method: "PATCH", body: { id: target!.id, role: "TEACHER" } });
  assert.equal(patch.status, 200);

  // Sesi lama langsung tidak berlaku (tokenVersion dinaikkan).
  const revoked = await api(sesiLama, "/api/profile", { method: "PATCH", body: { name: "Nama Lagi" } });
  assert.equal(revoked.status, 401);

  // Login baru memakai role hasil penyimpanan di DB.
  const sesiBaru: Jar = {};
  const relogin = await login(sesiBaru, username, "Password123");
  assert.equal(relogin.status, 200);
  assert.equal(relogin.data.redirect, "/teacher");
  assert.equal((await db.user.findUnique({ where: { username } }))!.role, "TEACHER");
  assert.ok((await db.teacherProfile.findUnique({ where: { userId: target!.id } })), "profil guru dibuat otomatis");

  // Audit log tercatat tanpa data sensitif.
  const logs = await db.auditLog.findMany({ where: { action: "USER_UPDATE", targetId: target!.id } });
  assert.ok(logs.length >= 1);
  assert.ok(!JSON.stringify(logs).includes("Password123"));

  // Nonaktifasi: login ditolak, sesi aktif mati.
  assert.equal((await api(admin, "/api/admin/users", { method: "PATCH", body: { id: target!.id, isActive: false } })).status, 200);
  const blocked = await login({}, username, "Password123");
  assert.equal(blocked.status, 403);
});

// ---------- 13-15: penyimpanan data ----------
test("13. hasil tes tersimpan dan konsisten dengan penilaian server", async () => {
  const jar: Jar = {};
  await login(jar, "student01", "Biolearn123");
  const qs = await api(jar, "/api/pretest/questions");
  const questions: any[] = qs.data.questions;
  // Hitung jawaban benar yang diharapkan dari sisi server (bukan dari body).
  const detail = await db.pretestQuestion.findMany({ include: { options: true } });
  const correctById = new Map(detail.map((q) => [q.id, q.options.find((o) => o.isCorrect)!.id]));
  let expectedCorrect = 0;
  const answers = questions.map((q, i) => {
    const correctId = correctById.get(q.id)!;
    const wrong = q.options.find((o: any) => o.id !== correctId)!;
    const pick = i < 5 ? q.options.find((o: any) => o.id === correctId)! : wrong;
    if (pick.id === correctId) expectedCorrect++;
    return { questionId: q.id, selectedOptionId: pick.id };
  });
  const res = await api(jar, "/api/pretest/submit", { method: "POST", body: { answers } });
  assert.equal(res.status, 200);
  assert.equal(res.data.correctCount, expectedCorrect);
  const attempt = await db.pretestAttempt.findUnique({ where: { id: res.data.id }, include: { answers: true } });
  assert.ok(attempt);
  assert.equal(attempt!.answers.filter((a) => a.isCorrect).length, expectedCorrect);
  assert.equal(attempt!.score, Math.round((expectedCorrect / 25) * 100));
});

test("14. progress terkait pengguna yang benar dan tidak duplikat", async () => {
  const jar: Jar = {};
  await login(jar, "student01", "Biolearn123");
  const me = await db.user.findUnique({ where: { username: "student01" } });
  const material = await db.material.findFirst();
  assert.ok(material);
  await api(jar, "/api/progress/complete", { method: "POST", body: { materialId: material!.id } });
  await api(jar, "/api/progress/complete", { method: "POST", body: { materialId: material!.id } });
  const rows = await db.progress.findMany({ where: { userId: me!.id, materialId: material!.id } });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]!.completed, true);
  assert.equal(rows[0]!.progressPercentage, 100);
});

test("15. enrollment tidak duplikat", async () => {
  const admin: Jar = {};
  await login(admin, "admin", "Biolearn123");
  const student = await createUserAsAdmin(admin, "STUDENT", "tst_nodup");
  const studentId = (await db.user.findUnique({ where: { username: student } }))!.id;
  await api(admin, "/api/enrollment/student", { method: "POST", body: { courseId: "course-biologi-mipa-2", studentId } });
  await api(admin, "/api/enrollment/student", { method: "POST", body: { courseId: "course-biologi-mipa-2", studentId } });
  const rows = await db.courseStudent.count({ where: { courseId: "course-biologi-mipa-2", studentId } });
  assert.equal(rows, 1);
});

// ---------- 16-18: dashboard, migrasi/seed, aplikasi utuh ----------
test("16. dashboard admin menampilkan angka dari database", async () => {
  const admin: Jar = {};
  await login(admin, "admin", "Biolearn123");
  const res = await fetch(`${BASE}/admin`, { headers: { cookie: admin.cookie! } });
  assert.equal(res.status, 200);
  const html = await res.text();
  const [siswa, enroll] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.courseStudent.count(),
  ]);
  assert.ok(html.includes("Dashboard Admin"));
  assert.ok(html.includes(`>${siswa}<`), "jumlah siswa dari DB ditampilkan");
  assert.ok(html.includes(`>${enroll}<`), "jumlah enrollment dari DB ditampilkan");
});

test("17. migrasi sudah diterapkan", { timeout: 120_000 }, () => {
  const status = execSync("npx prisma migrate status", { cwd: ROOT, encoding: "utf8" });
  assert.ok(status.includes("up to date"), "skema DB selaras dengan migrasi");
});

test("17b. seed dua kali tidak menggandakan data", { timeout: 300_000 }, async () => {
  const countBefore = await db.user.count();
  execSync("npx tsx prisma/seed.ts", { cwd: ROOT, stdio: "pipe" });
  const countAfter = await db.user.count();
  assert.equal(countAfter, countBefore, "menjalankan seed ulang tidak menambah pengguna");
});

test("18. aplikasi tetap berfungsi setelah perubahan (login → materi → pretest)", async () => {
  const res = await fetch(`${BASE}/login`);
  assert.equal(res.status, 200);
  const jar: Jar = {};
  await login(jar, "student01", "Biolearn123");
  const materi = await fetch(`${BASE}/materi/sel-dan-struktur-sel`, { headers: { cookie: jar.cookie! } });
  assert.equal(materi.status, 200);
  assert.ok((await materi.text()).includes("Model 3D"));
  const qs = await api(jar, "/api/pretest/questions");
  assert.equal(qs.status, 200);
  assert.equal(qs.data.questions.length, 25);
});

// ---------- tambahan: brute force ----------
test("19. rate limit login aktif (percobaan ke-6 ditolak 429)", async () => {
  const u = `tst_ratelimit_${rand()}`;
  let last = 0;
  for (let i = 0; i < 6; i++) {
    const res = await api({}, "/api/auth/login", { method: "POST", body: { username: u, password: "salah" } });
    last = res.status;
  }
  assert.equal(last, 429);
});
