import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ACCESS_TOKEN_NAME, IS_OIDC_ENABLED } from "@/config/internals";
import { TokenUser } from "@/types/api";
import { redirect } from "next/navigation";
import { getAuthSession } from "./nextAuth";

const decodeTokenPayload = (token?: string) => {
  if (!token) return undefined;
  try {
    return jwt.decode(token) as JwtPayload | null;
  } catch {
    return undefined;
  }
};

export const getLoginRoute = (returnTo = "/") => {
  if (IS_OIDC_ENABLED) {
    return `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
  }
  return "/login";
};

export async function getUserAuthTagId(): Promise<string | number> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_NAME)?.value;
  const decoded = decodeTokenPayload(token);

  if (decoded?.user && typeof decoded.user === "object") {
    const user = decoded.user as Partial<TokenUser>;
    if (typeof user.id === "number") {
      return user.id;
    }
  }

  if (decoded?.sub) {
    return decoded.sub;
  }

  const session = await getAuthSession();
  if (session?.user?.email) {
    return session.user.email;
  }

  if (!token && !session) {
    redirect(getLoginRoute());
  }

  return "auth-user";
}

