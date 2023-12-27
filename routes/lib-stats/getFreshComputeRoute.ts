import { Context } from "https://deno.land/x/hono@v3.11.7/context.ts";
import { Env } from "https://deno.land/x/hono@v3.11.7/types.ts";
import { getViewerRepos } from "../../utils/github/getViewerRepos.ts";
import { Edge } from "../../utils/github/viewer-repo-types.ts";
import { logError } from "../../utils/helpers.ts";
import { enqueueRepoPackagesCompute } from "../../utils/github/enqueue.ts";

export async function getFreshComputeRoute(
  c: Context<
    Env,
    "/stats/fresh_compute",
    Record<string | number | symbol, never>
  >,
) {
  const kv = await Deno.openKv();
  const headers = c.req.raw.headers;
  const gh_token = headers.get("Authorization");
  if (!gh_token) {
    return c.text("PAT required", 401);
  }
  const repos = await fetchReposRecursivelyWithGQL({ viewer_token: gh_token });

  if (!repos) {
    return c.text("error fetching repos", 401);
  }
  // logSuccess("fetched repos length  ================= ", repos?.length);
  console.log("=== FETCHED REPOS === ", repos?.length);
  // kv.set(["repos", gh_token], repos);
  await enqueueRepoPackagesCompute({ repos, viewer_token: gh_token });
  return c.text("JOB scheduled , check back later", 200);
}

interface FetchRepoRecursivelyWithGQL {
  viewer_token: string;

  all_repos?: Edge[];
  cursor?: string;
}

//  Recusively

async function fetchReposRecursivelyWithGQL({
  viewer_token,
  all_repos = [],
  cursor,
}: FetchRepoRecursivelyWithGQL) {
  try {
    const repos = await getViewerRepos(viewer_token, cursor);
    if (repos.data) {
      const fetched_repos = repos.data.data.viewer.repositories.edges;
      const totalCount = repos.data.data.viewer.repositories.totalCount;
      const next_cursor =
        repos.data.data.viewer.repositories.pageInfo.endCursor;
      const new_repos = all_repos.concat(fetched_repos);

      console.log({
        fetched_repos_count: new_repos.length,
        totalCount,
        next_cursor,
      });

      if (new_repos.length < totalCount) {
        return fetchReposRecursivelyWithGQL({
          viewer_token,
          cursor: next_cursor,
          all_repos: new_repos,
        });
      }
      return new_repos;
    }
  } catch (error) {
    logError(error);
  }
}
