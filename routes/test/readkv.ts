import { Context } from "https://deno.land/x/hono@v3.11.7/context.ts";
import { Env } from "https://deno.land/x/hono@v3.11.7/types.ts";
import { DecodedPackageJson } from "../github/getOneRepoLibraries.ts";
export async function getTestReadKVRoute(
  c: Context<Env, "/test/kv", Record<string | number | symbol, never>>,
) {
  const kv = await Deno.openKv();
  // deno-lint-ignore prefer-const
  let kv_repo_list = [];
  //   const repos = await kv.get(["repo_pkgjson","tigawanna/all-emps-web"]);
  const repos = await kv.list<DecodedPackageJson>({ prefix: ["repo_pkgjson"] });
  for await (const entry of repos) {
    // logSuccess("entry  ================= ", entry);
    kv_repo_list.push(entry);
  }
//   const highlighted_library_stats = kv_repo_list.reduce(
//     (acc: Record<string, number>, repo) => {
//       if ("documentation_url" in repo && "message" in repo) return acc;
//       repo?.favdeps?.forEach((item) => {
//         acc[item] = (acc[item] || 0) + 1;
//       });
//       return acc;
//     },
//     {},
//   );
// const library_stats = kv_repo_list.reduce(
//     (acc: Record<string, number>, repo) => {
//       if ("documentation_url" in repo && "message" in repo) return acc;
//       Object.entries(repo?.dependencies || {}).forEach(([key, _]) => {
//         if(key.includes("@types")) return
//         acc[key] = (acc[key] || 0) + 1;
//       },{})
//       Object.entries(repo?.devDependencies || {}).forEach(([key, _]) => {
//         if (key.includes("@types")) return
//         acc[key] = (acc[key] || 0) + 1;
//       },{})
//     return acc;
//     },
//     {},
//   );

//   const framework_stats = kv_repo_list.reduce((acc: Record<string, number>, repo) => {
//   if ("documentation_url" in repo && "message" in repo) return acc;
//     if (repo?.pkg_type) {
//         acc[repo?.pkg_type] = (acc[repo?.pkg_type] || 0) + 1;
//       }
//       return acc;
//     },{}
//   );

  return c.json({ kv_repo_list });
}

// output
