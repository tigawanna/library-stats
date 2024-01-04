import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";
import { getPKGStatsRoute } from "./helpers/getLibStatswithQueues.ts";
import { getFreshComputeRoute } from "./helpers/computeLibStats.ts";
import { getGithubViewer } from "../../utils/github/getViewer.ts";

const statsRoute = new Hono();
statsRoute.get("/", (c) => {
  return getPKGStatsRoute(c);
});
statsRoute.get("/langs", async(c) => {
  const headers = c.req.raw.headers;
  const gh_token = headers.get("Authorization");
  if (!gh_token) {
    return c.text("PAT required", 401);
  }
  const viewer = await getGithubViewer(gh_token);
  if (!viewer) {
    return c.text("Who are you?", 401);
  }
  const kv= await Deno.openKv();
  const language_stats = await kv.get(["language_stats", viewer.login]);
  return c.json({ language_stats });
});

statsRoute.get("/enqueue_compute", (c) => {
  return getFreshComputeRoute(c);
});

export { statsRoute };
