import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "gr10k_session";
const SESSION_VALUE = "granted";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("from") ?? "/");

  const expected = process.env.APP_PASSWORD ?? "";
  const url = new URL(request.url);

  if (!expected) {
    url.pathname = "/login";
    url.searchParams.set("error", "not-configured");
    return NextResponse.redirect(url);
  }

  if (password !== expected) {
    url.pathname = "/login";
    url.searchParams.set("error", "1");
    url.searchParams.set("from", redirectTo);
    return NextResponse.redirect(url);
  }

  url.pathname = redirectTo.startsWith("/") ? redirectTo : "/";
  url.search = "";
  const response = NextResponse.redirect(url);
  response.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
