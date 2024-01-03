import {
  logger,
  poweredBy,
} from "https://deno.land/x/hono@v3.11.7/middleware.ts";
import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";
import { getPKGStatsRoute } from "./routes/lib-stats/getLibStats.ts";
import { getFreshComputeRoute } from "./routes/lib-stats/getFreshComputeRoute.ts";
import { getOneRepoPackageJson } from "./utils/github/getOneRepoLibraries.ts";
import { Edge, getViewerRepos } from "./utils/github/getViewerRepos.ts";

const app = new Hono();


const db = await Deno.openKv();

db.listenQueue(async (msg) => {
  const data = msg as { message: string; value: Edge ; viewer_token: string ;viewer_name: string};

  if (!data.value) {
    return;
  }
  if (!data.message) {
    return;
  }
  if (data.message === "repo_pkgjson_queue") {
    console.log("writing data ==== ", data.value);
    const pkgjson = await getOneRepoPackageJson(data.value.node.nameWithOwner,data.viewer_token);
    if (!pkgjson) return;
    if ("documentation_url" in pkgjson || "message" in pkgjson) return;

    // const kv = await Deno.openKv("https://api.deno.com/databases/80135a8a-6c16-4f9f-ae52-5100637fed23/connect");
    // const db = await Deno.openKv();
    await db.set([
      "repo_pkgjson",
      data.viewer_name,
      data.value.node.nameWithOwner,
    ], pkgjson);
  }

  return;
});

app.use("*", logger(), poweredBy());
app.get("/", (c) => {
  return c.text("Hello Deno!");
});

app.get("/repo", async(c) => {
  const {repo_name} = c.req.query() as {repo_name: string};
  console.log({repo_name});
  // const repos = await Array.fromAsync(db.list({ prefix: ["repo_pkgjson", "Dennis kinuthia", "tigawanna/betterblocks"] }));
  const repo = await db.get(["repo_pkgjson", "Dennis kinuthia", repo_name]);
  return c.json(repo);
});

app.get("/stats", (c) => {
  return getPKGStatsRoute(c);
});

app.get("/stats/fresh_compute", (c) => {
  return getFreshComputeRoute(c);
});

app.get("/kv", async(c) => {
const data = await Array.fromAsync(db.list({ prefix: ["repo_pkgjson"] }));
return c.json({data})
})

app.get("/repos", async(c) => { 
  const headers = c.req.raw.headers;
  const gh_token = headers.get("Authorization");
  if (!gh_token) {
    return c.text("PAT required", 401);
  } 
  const repos = await getViewerRepos(gh_token)
  return c.json({repos})
})




Deno.serve(app.fetch);
