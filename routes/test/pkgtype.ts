import { Context } from "https://deno.land/x/hono@v3.11.7/context.ts";
import { Env } from "https://deno.land/x/hono@v3.11.7/types.ts";
import { getOneRepoPackageJson } from "../../utils/github/getOneRepoLibraries.ts";
export async function getTestPkgRoute(
  c: Context<Env, "/test/pkg", Record<string | number | symbol, never>>,
) {
  const headers = c.req.raw.headers;
  const gh_token = headers.get("Authorization");
  if (!gh_token) {
    return c.text("PAT required", 401);
  }
  const pkg_type = await getOneRepoPackageJson(
    "tigawanna/library-stats",
    gh_token,
  );
  return c.json(pkg_type);
}
