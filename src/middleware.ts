import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const role = Number(request.cookies.get("validateU")?.value);
  // ROLES
  // 1 - USER
  // 2 - ADMIN

  const adminPages = ["/dashboard/users"];

  const signinURL = new URL("/", request.url);
  const dashURL = new URL("/dashboard", request.url);

  if (!token) {
    if (request.nextUrl.pathname === "/") {
      return NextResponse.next();
    }

    return NextResponse.redirect(signinURL);
  }

  if (adminPages.includes(request.nextUrl.pathname) && role !== 2) {
    return NextResponse.redirect(dashURL);
  }

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(dashURL);
  }
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
