import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const staff = request.cookies.get("appsheetto_staff");
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    if (staff) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!staff) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
