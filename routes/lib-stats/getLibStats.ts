import { Context } from "https://deno.land/x/hono@v3.11.7/context.ts";
import { Env } from "https://deno.land/x/hono@v3.11.7/types.ts";
import { DecodedPackageJson } from "../../utils/github/getOneRepoLibraries.ts";
import { getGithubViewer } from "../../utils/github/getViewer.ts";

export async function getPKGStatsRoute(
  c: Context<Env, "/stats", Record<string | number | symbol, never>>,
) {
  const kv = await Deno.openKv();
  const headers = c.req.raw.headers;
  const gh_token = headers.get("Authorization");
  if (!gh_token) {
    return c.text("PAT required", 401);
  }

  const viewer = await getGithubViewer(gh_token);
  // deno-lint-ignore prefer-const
  let kv_repo_list = [];
  const repos = await kv.list<DecodedPackageJson>({
    prefix: ["repo_pkgjson", viewer.name],
  });
  for await (const entry of repos) {
    kv_repo_list.push(entry.value);
  }

  const highlighted_library_stats = kv_repo_list.reduce(
    (acc: Record<string, number>, repo) => {
      if ("documentation_url" in repo && "message" in repo) return acc;
      repo?.favdeps?.forEach((item) => {
        acc[item] = (acc[item] || 0) + 1;
      });
      return acc;
    },
    {},
  );
  const library_stats = kv_repo_list.reduce(
    (acc: Record<string, number>, repo) => {
      if ("documentation_url" in repo && "message" in repo) return acc;
      Object.entries(repo?.dependencies || {}).forEach(([key, _]) => {
        if (key.includes("@types")) return;
        acc[key] = (acc[key] || 0) + 1;
      }, {});
      Object.entries(repo?.devDependencies || {}).forEach(([key, _]) => {
        if (key.includes("@types")) return;
        acc[key] = (acc[key] || 0) + 1;
      }, {});
      return acc;
    },
    {},
  );

  const framework_stats = kv_repo_list.reduce(
    (acc: Record<string, number>, repo) => {
      if ("documentation_url" in repo && "message" in repo) return acc;
      if (repo?.pkg_type) {
        acc[repo?.pkg_type] = (acc[repo?.pkg_type] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  return c.json({ highlighted_library_stats, library_stats, framework_stats });
}

// output
