import { getServerSession, type NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
import { IS_OIDC_ENABLED } from "@/config/internals";

const issuer = process.env.OIDC_ISSUER_URL?.replace(/\/$/, "");

const oidcProvider = issuer
  ? {
      id: "oidc",
      name: "OIDC",
      type: "oauth",
      wellKnown: `${issuer}/.well-known/openid-configuration`,
      clientId: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      idToken: true,
      checks: ["pkce", "state"],
      authorization: {
        params: {
          scope: process.env.OIDC_SCOPE ?? "openid profile email",
        },
      },
      profile(profile: Record<string, unknown>) {
        return {
          id:
            (profile.sub as string | undefined) ??
            (profile.id as string | undefined) ??
            "oidc-user",
          name:
            (profile.name as string | undefined) ??
            (profile.preferred_username as string | undefined) ??
            null,
          email: (profile.email as string | undefined) ?? null,
        };
      },
    }
  : null;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: oidcProvider ? [oidcProvider] : [],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (account?.expires_at) {
        token.accessTokenExpiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.accessTokenExpiresAt = token.accessTokenExpiresAt as
        | number
        | undefined;
      return session;
    },
  },
};

export const getAuthSession = async (): Promise<Session | null> => {
  if (!IS_OIDC_ENABLED) {
    return null;
  }

  return getServerSession(authOptions);
};

export const getAuthAccessToken = async (): Promise<string | undefined> => {
  const session = await getAuthSession();
  return session?.accessToken;
};
