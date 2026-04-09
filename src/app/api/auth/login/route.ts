import { NextRequest, NextResponse } from "next/server";
import { IS_OIDC_ENABLED } from "@/config/internals";

const sanitizeReturnTo = (returnTo?: string | null) => {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return "/";
  }
  return returnTo;
};

export async function GET(req: NextRequest) {
  const returnTo = sanitizeReturnTo(req.nextUrl.searchParams.get("returnTo"));

  if (!IS_OIDC_ENABLED) {
    const fallbackLoginUrl = process.env.NEXT_PUBLIC_LOGIN_URL;
    if (fallbackLoginUrl) {
      return NextResponse.redirect(fallbackLoginUrl);
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const callbackUrl = new URL(returnTo, req.nextUrl.origin).toString();
  const authUrl = new URL("/api/auth/signin/oidc", req.nextUrl.origin);
  authUrl.searchParams.set("callbackUrl", callbackUrl);

  return NextResponse.redirect(authUrl);
}



