"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function CompleteButton({ materialId }: { materialId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function done() {
    setLoading(true);
    await fetch("/api/progress/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ materialId }) });
    setLoading(false);
    router.refresh();
  }
  return <button onClick={done} disabled={loading} className="btn-primary text-sm"><CheckCircle2 size={15} /> {loading ? "Menyimpan..." : "Tandai Selesai"}</button>;
}
