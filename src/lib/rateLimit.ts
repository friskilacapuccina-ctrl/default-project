/**
 * Rate limiter sederhana berbasis memori (sliding window) untuk endpoint
 * sensitif seperti login dan AI Tutor. Cukup untuk aplikasi single-instance
 * (dev / demo kelas); untuk deployment multi-instance gunakan Redis.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bersihkan bucket yang kedaluwarsa secara berkala agar memori tidak bocor.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}

/**
 * Cek kuota. true = request diizinkan, false = melebihi batas.
 * @param key    Kunci unik (mis. `login:1.2.3.4:budi`)
 * @param limit  Maksimal request dalam jendela waktu
 * @param windowMs Jendela waktu dalam milidetik
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

/** Hapus bucket (mis. setelah login berhasil) agar pengguna tidak terkunci. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/** Ambil IP klien dari header proxy (fallback aman untuk lokal). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "local";
}
