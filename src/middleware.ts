import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 需要登录的路由
const protectedRoutes = ["/cart", "/orders"];
// 需要 ADMIN 角色的路由
const adminRoutes = ["/admin"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // 未登录 → 重定向到登录页
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtected && !session) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 非 ADMIN → 重定向到首页
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdmin && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/cart/:path*", "/orders/:path*", "/admin/:path*"],
};
