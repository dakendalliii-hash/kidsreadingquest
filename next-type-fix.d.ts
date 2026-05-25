declare module "next/headers" {
  export function cookies(): import("next/dist/server/web/spec-extension/adapters/request-cookies").ReadonlyRequestCookies;
}
