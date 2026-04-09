import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ACCESS_TOKEN_NAME, IS_OIDC_ENABLED } from "@/config/internals";
import { TokenUser, CombinedUser } from "@/types/api";
import { RoleName } from "@/types/roles";
import ProtectedPage from "./components/ProtectedPage";
import getMe from "@/actions/getMe";
import getCustodians from "@/actions/custodian/getCustodians";
import getFeatureFlags from "@/actions/getFeatureFlags";
import { isStandalone } from "@/utils/modes";
import { ErrorMode } from "@/lib/apiClient";
import getWorkgroups from "@/actions/workgroup/getWorkgroups";
import getUserCollections from "@/actions/collection/getUserCollections";
import { getLoginRoute } from "@/lib/auth";
import { getAuthAccessToken } from "@/lib/nextAuth";

const applicationMode = process.env.APPLICATION_MODE;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(ACCESS_TOKEN_NAME)?.value ?? (await getAuthAccessToken());
  let decoded: JwtPayload | undefined;
  try {
    decoded = token ? ((jwt.decode(token) as JwtPayload | null) ?? undefined) : undefined;
  } catch {
    decoded = undefined;
  }

  if (!token) {
    if (IS_OIDC_ENABLED) {
      redirect(getLoginRoute());
    }
    if (isStandalone(applicationMode)) {
      // No token — render the client SignIn component so users can sign in.
      redirect("/login");
    } else {
      redirect("/403?reason=no-token");
    }
  }

  const h = await headers();
  const requestNow = h?.get("x-request-now");
  const now = requestNow !== null ? Math.floor(Number(requestNow)) : 0;
  const exp = typeof decoded?.exp === "number" ? decoded.exp : undefined;
  if (exp && now >= Math.floor(exp)) {
    redirect("/api/auth/logout");
  }

  const user = decoded?.user as TokenUser | null;

  const { data: me, error } = await getMe({ errorMode: ErrorMode.RESULT });
  const { code: errorCode } = error ?? {};

  if (errorCode === 404) {
    if (isStandalone(applicationMode)) {
      notFound();
    }
    redirect("/user-not-found");
  }

  const roles = me.roles.map((r) => r.name) ?? [];

  const hasGeneralAccess = roles?.includes(RoleName.USER);
  const hasAdminAccess = roles.includes(RoleName.ADMIN);
  const hasTeamAccess = me.custodians.length > 0;

  if (!(hasGeneralAccess || hasAdminAccess || hasTeamAccess)) {
    redirect("/403?reason=missing-role");
  }

  const { data: flags } = await getFeatureFlags();
  const { data: custodians } = await getCustodians();
  const { data: workgroups } = await getWorkgroups();
  const { data: collections } = await getUserCollections();

  const combinedUser = { ...me, token_user: user ?? null } as CombinedUser;

  return (
    <ProtectedPage
      user={combinedUser}
      collections={collections}
      custodians={custodians}
      workgroups={workgroups}
      featureFlags={flags}
    >
      {children}
    </ProtectedPage>
  );
}
