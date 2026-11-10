import { db } from "./db";
import type { Prisma } from "@prisma/client";

/**
 * Tulis catatan audit untuk aktivitas administratif sensitif
 * (perubahan role, aktivasi/nonaktifasi akun, assignment guru, dsb).
 * Jangan pernah memasukkan password, hash, atau token ke `detail`.
 */
export async function writeAuditLog(params: {
  actorId: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  detail?: Record<string, unknown>;
}) {
  try {
    await db.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        detail: (params.detail as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  } catch (e) {
    // Log audit tidak boleh menjatuhkan request utama.
    console.error("[audit] gagal menulis log:", e instanceof Error ? e.message : e);
  }
}
