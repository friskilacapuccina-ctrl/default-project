"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function VideoDoneButton({ videoId }: { videoId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function done() {
    setLoading(true);
    await fetch("/api/video/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId }) });
    setLoading(false);
    router.refresh();
  }
  return <button onClick={done} disabled={loading} className="btn-primary text-sm">{loading ? "Menyimpan..." : "Tandai Selesai Ditonton"}</button>;
}
