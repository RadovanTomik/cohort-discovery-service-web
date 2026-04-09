export const ACCESS_TOKEN_NAME = process.env.COOKIE_TOKEN_NAME ?? "token";
export const QUERY_BUILDER_GUIDANCE_COOKIE = "queryBuilderGuidanceRead";

export const AUTH_PROVIDER = process.env.AUTH_PROVIDER ?? "legacy";
export const IS_OIDC_ENABLED = AUTH_PROVIDER === "oidc";

export const OIDC_ISSUER_URL = process.env.OIDC_ISSUER_URL;
export const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID;
export const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET;
export const OIDC_SCOPE = process.env.OIDC_SCOPE ?? "openid profile email";

