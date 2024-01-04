import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";
import { getViewerRepos } from "../../utils/github/getViewerRepos.ts";

const githubRoute = new Hono();

githubRoute.get("/", (c) => c.text(`/github route: /repos to list repos`));

githubRoute.get("/repos", async (c) => {
  const headers = c.req.raw.headers;
  const gh_token = headers.get("Authorization");
  if (!gh_token) {
    return c.text("PAT required", 401);
  }
  const repos = await getViewerRepos(gh_token);
  return c.json({ repos });
});

export { githubRoute };
