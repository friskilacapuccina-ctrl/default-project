import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecret } from "@/lib/authSecret";

const PUBLIC = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

async function session(req: NextRequest) {
  const token = req.cookies.get("biolearn_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return { userId: String(payload.sub), role: String(payload.role) };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname.match(/\.(ico|png|jpg|pdf|css|js)$/)) {
    return NextResponse.next();
  }
  if (PUBLIC.includes(pathname)) return NextResponse.next();
  const s = await session(req);
  if (!s) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/admin") && s.role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = s.role === "TEACHER" ? "/teacher" : "/dashboard";
    return NextResponse.redirect(url);
  }
  // Defense-in-depth: API admin juga ditolak di middleware (verifikasi
  // final tetap di route handler dengan cek role terkini di database).
  if (pathname.startsWith("/api/admin") && s.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (pathname.startsWith("/teacher") && !["TEACHER", "ADMIN"].includes(s.role)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
