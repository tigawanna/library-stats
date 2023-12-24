import { Context } from "https://deno.land/x/hono@v3.11.7/context.ts";
import { Env } from "https://deno.land/x/hono@v3.11.7/types.ts";
import { computeAllPkgJsons, getOneRepoPackageJson } from "./helpers.ts";

export async function getOneRepolibStats(
  c: Context<Env, "/owner", Record<string | number | symbol, never>>,
) {
  const kv = await Deno.openKv();
  const kv_contents = await kv.get(["tigawanna"]);
  console.log({ kv_contents });
  const headers = c.req.raw.headers;
  const gh_token = headers.get("Authorization");
  if (!gh_token) {
    return c.text("PAT required", 401);
  }

  const repo_pkg_json = await getOneRepoPackageJson(
    "tigawanna/tigawanna",
    gh_token,
  );
  if (!repo_pkg_json || (repo_pkg_json && "message" in repo_pkg_json)) {
    return c.text(`Issue getting repo: ${repo_pkg_json?.message}`, 404);
  }
 const all_pkg_jsons = await computeAllPkgJsons(gh_token);

  await kv.set(["tigawanna"], 
 {
    favdeps: repo_pkg_json.favdeps,
    type: repo_pkg_json.pkg_type,
  }
  );

  console.log({ gh_token, repo_pkg_json });
  return c.json(repo_pkg_json);
}
