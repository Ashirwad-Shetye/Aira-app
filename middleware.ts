// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/about",
  "/pricing",
  "/forgot-password",
  "/reset-password/:path*",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_ROUTES.some(
      (route) =>
        pathname === route ||
        (route.includes(":path*") && pathname.startsWith(route.split(":")[0]))
    )
  ) {
    return NextResponse.next();
  }

  const session = await auth();
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};