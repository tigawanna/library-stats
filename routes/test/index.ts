import { Context } from "https://deno.land/x/hono@v3.11.7/context.ts";
import { Env } from "https://deno.land/x/hono@v3.11.7/types.ts";
import { getViewerRepos } from "../github/getViewerRepos.ts";
import { Edge } from "../github/viewer-repo-types.ts";
import { logError, logSuccess } from "../../utils/helpers.ts";
import { enqueueRepoPackagesCompoute } from "../github/enqueue.ts";

export async function getTestRoute(
  c: Context<Env, "/test", Record<string | number | symbol, never>>
) {
  const kv = await Deno.openKv();
  const headers = c.req.raw.headers;
  const gh_token = headers.get("Authorization");
  if (!gh_token) {
    return c.text("PAT required", 401);
  }
  const repos = await fetchReposRecursivelyWithGQL({ viewer_token: gh_token });
  if(!repos){
    return c.text("error fetching repos", 401);
  }
  logSuccess("fetched repos length  ================= ", repos?.length);
  kv.set(["repos", gh_token], JSON.stringify(repos));
  await enqueueRepoPackagesCompoute({ repos, viewer_token: gh_token });
  return c.json(repos);
}

interface FetchRepo {
  viewer_token: string;
  page?: number;
  repos?: any[];
}
async function fetchReposWithREST({
  viewer_token,
  page = 1,
  repos = [],
}: FetchRepo): Promise<any[]> {
  const response = await fetch(`https://api.github.com/user/repos?page=${page}&per_page=10`, {
    headers: {
      Authorization: `bearer ${viewer_token}`,
      "Content-Type": "application/json",
      accept: "application/vnd.github.hawkgirl-preview+json",
    },
  });
  const fetchedRepos = await response.json();
  repos.push(...fetchedRepos);

  if (repos.length < 30) {
    return fetchReposWithREST({ viewer_token, page: page + 1, repos });
  }
  console.log("apge==", page);
  console.log("length==", repos.length);
  return repos;
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
      const next_cursor = repos.data.data.viewer.repositories.pageInfo.endCursor;
      const new_repos = all_repos.concat(fetched_repos);

      console.log({
        fetched_repos_count: new_repos.length,
        totalCount,
        next_cursor,
      })


      if (new_repos.length < totalCount) {
       return  fetchReposRecursivelyWithGQL({
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
