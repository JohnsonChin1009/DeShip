import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/sign-up"];
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow access to non-protected routes
  if (!isProtected) return NextResponse.next();

  // Check if session exists (Privy session token or however you track auth)
  const hasSession = request.cookies.get("privy-token");

  // If no session and trying to access a protected route → redirect to homepage
  if (!hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-up"],
};
