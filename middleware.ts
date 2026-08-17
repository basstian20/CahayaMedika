import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Route guard untuk /admin/* (kecuali /admin/login) — hanya 1 role,
// tidak ada RBAC bertingkat (TSD §4.1), jadi cukup cek "ada session atau tidak".
// UX-layer saja (CLAUDE.md §2.1). Server tetap requireAdmin() per-request + RLS.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (!req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname === "/admin/login") {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) =>
          res.cookies.set(name, value, options),
        remove: (name: string, options: CookieOptions) =>
          res.cookies.set(name, "", { ...options, maxAge: 0 }),
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = new URL("/admin/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
