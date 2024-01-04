import { Context } from "https://deno.land/x/hono@v3.11.7/context.ts";
import { Env } from "https://deno.land/x/hono@v3.11.7/types.ts";
import { Edge, getViewerRepos } from "../../../utils/github/getViewerRepos.ts";
import { logError } from "../../../utils/helpers.ts";
import { enqueueRepoPackagesCompute } from "../../../utils/github/enqueue.ts";
import { getGithubViewer } from "../../../utils/github/getViewer.ts";

export async function getFreshComputeRoute(
  c: Context<
    Env,
    "/stats/fresh_compute",
    Record<string | number | symbol, never>
  >,
) {
  try {
    const headers = c.req.raw.headers;
    const gh_token = headers.get("Authorization");
    if (!gh_token) {
      return c.text("PAT required", 401);
    }
    const viewer = await getGithubViewer(gh_token);
    if (!viewer) {
      return c.text("Who are you?", 401);
    }
    const repos = await fetchReposRecursivelyWithGQL({
      viewer_token: gh_token,
    });

    if (!repos) {
      return c.text("error fetching repos", 401);
    }
    // const kv = await Deno.openKv("https://api.deno.com/databases/80135a8a-6c16-4f9f-ae52-5100637fed23/connect");
  const kv = await Deno.openKv();
    // console.log("=== FETCHED REPOS === ", repos?.length);
    const language_stats = repos.reduce(
      (acc: { [key: string]: { color: string; count: number } }, repo) => {
        if (!repo.node || !repo.node.languages) return acc;
        repo.node.languages.edges.forEach((item) => {
          acc[item.node.name] = {
            color: item.node.color,
            count: (acc[item.node.name]?.count || 0) + 1,
          };
        });
        return acc;
      },
      {},
    );

    await kv.set(["language_stats", viewer.login], language_stats);
    console.log("=== Language stats === ", language_stats);
    // await kv.set(["all-repos"], repos);
    await enqueueRepoPackagesCompute({ repos, viewer_token: gh_token });
    return c.text("JOB scheduled , check back later", 200);
  } catch (error) {
    return c.text("error fetching repos" + error.message, 401);
  }
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
