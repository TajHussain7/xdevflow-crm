import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Note: Token is set on backend domain (xdevflow-crm.onrender.com)
  // Frontend is on different domain (xdevflow-crm-nine.vercel.app)
  // Cookies are domain-scoped, so we rely on localStorage & API auth checks instead

  const pathname = request.nextUrl.pathname;
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // Allow auth pages freely
  if (isAuthPage) {
    return NextResponse.next();
  }

  // For protected routes, let client-side handle auth verification
  // API interceptor will redirect to /login on 401
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
