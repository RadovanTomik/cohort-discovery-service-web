import { NextRequest, NextResponse } from "next/server";
import { IS_OIDC_ENABLED } from "@/config/internals";

export async function GET(req: NextRequest) {
  if (!IS_OIDC_ENABLED) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const authCallback = new URL("/api/auth/callback/oidc", req.nextUrl.origin);
  req.nextUrl.searchParams.forEach((value, key) => {
    authCallback.searchParams.set(key, value);
  });

  return NextResponse.redirect(authCallback);
}


