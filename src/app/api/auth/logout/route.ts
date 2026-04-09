import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_NAME, IS_OIDC_ENABLED } from "@/config/internals";

export async function GET(req: NextRequest) {
  if (IS_OIDC_ENABLED) {
    const callbackUrl = new URL("/login", req.nextUrl.origin).toString();
    const signoutUrl = new URL("/api/auth/signout", req.nextUrl.origin);
    signoutUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(signoutUrl);
  }

  const url = new URL("/login", req.url);
  const response = NextResponse.redirect(url);
  // Delete via multiple strategies to handle domain-scoped cookies set by
  // different origins (e.g., Cypress test runner sets domain: "localhost").
  response.cookies.delete(ACCESS_TOKEN_NAME);
  response.cookies.set(ACCESS_TOKEN_NAME, "", {
    expires: new Date(0),
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  return response;
}
