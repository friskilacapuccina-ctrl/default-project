/** Shared by the Node.js auth helpers and the Edge middleware. */
export function getAuthSecret(): Uint8Array {
  const configured = process.env.AUTH_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!configured || configured.length < 32) {
      throw new Error("AUTH_SECRET must be configured with at least 32 characters in production.");
    }
    return new TextEncoder().encode(configured);
  }

  return new TextEncoder().encode(configured || "dev-secret-min-32-karakter-untuk-biolearn-ai");
}
