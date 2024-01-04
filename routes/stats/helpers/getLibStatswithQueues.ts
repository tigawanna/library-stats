import { Context } from "https://deno.land/x/hono@v3.11.7/context.ts";
import { Env } from "https://deno.land/x/hono@v3.11.7/types.ts";
import { DecodedPackageJson } from "../../../utils/github/getOneRepoLibraries.ts";

export async function getPKGStatsRoute(
  c: Context<Env, "/stats", Record<string | number | symbol, never>>,
) {
  const kv = await Deno.openKv();
  // const kv = await Deno.openKv(
  //   "https://api.deno.com/databases/80135a8a-6c16-4f9f-ae52-5100637fed23/connect",
  // );

  const headers = c.req.raw.headers;
  const gh_token = headers.get("Authorization");
  if (!gh_token) {
    return c.text("PAT required", 401);
  }

  const key = "repo_pkgjson";
  const kv_repo_list = await Array.fromAsync(
    kv.list<DecodedPackageJson>({ prefix: [key] }),
  );

  const highlighted_library_stats = kv_repo_list.reduce(
    (acc: Record<string, number>, repo) => {
      if ("documentation_url" in repo.value && "message" in repo.value) {
        return acc;
      }
      repo.value?.favdeps?.forEach((item) => {
        acc[item] = (acc[item] || 0) + 1;
      });
      return acc;
    },
    {},
  );

  const library_stats = kv_repo_list.reduce(
    (acc: Record<string, number>, repo) => {
      if ("documentation_url" in repo.value && "message" in repo.value) {
        return acc;
      }
      Object.entries(repo.value?.dependencies || {}).forEach(([key, _]) => {
        if (key.includes("@types")) return;
        acc[key] = (acc[key] || 0) + 1;
      }, {});
      Object.entries(repo.value?.devDependencies || {}).forEach(([key, _]) => {
        if (key.includes("@types")) return;
        acc[key] = (acc[key] || 0) + 1;
      }, {});
      return acc;
    },
    {},
  );

  const framework_stats = kv_repo_list.reduce(
    (acc: Record<string, number>, repo) => {
      if ("documentation_url" in repo.value && "message" in repo.value) {
        return acc;
      }
      if (repo.value?.pkg_type) {
        acc[repo.value?.pkg_type] = (acc[repo.value?.pkg_type] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  return c.json({ highlighted_library_stats, library_stats, framework_stats });
}

// output
