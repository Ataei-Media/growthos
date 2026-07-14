import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const AUTH_PAGES = ["/login", "/sign-up", "/forgot-password"];

function isProtected(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin")
  );
}

function withSecurityHeaders(res: NextResponse) {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

function redirectTo(request: NextRequest, pathname: string, search = "") {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  return withSecurityHeaders(NextResponse.redirect(url));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Without live Supabase credentials we can't establish a session; still guard
  // protected routes by sending users to login.
  if (!isSupabaseConfigured()) {
    if (isProtected(pathname)) {
      return redirectTo(request, "/login", `?redirect=${encodeURIComponent(pathname + search)}`);
    }
    return withSecurityHeaders(NextResponse.next());
  }

  const { response, user } = await updateSession(request);

  if (!user && isProtected(pathname)) {
    return redirectTo(request, "/login", `?redirect=${encodeURIComponent(pathname + search)}`);
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    const redirect = redirectTo(request, "/dashboard");
    // Preserve any rotated auth cookies from the refreshed session.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return withSecurityHeaders(response);
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
