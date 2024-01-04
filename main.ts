import {
  logger,
  poweredBy,
} from "https://deno.land/x/hono@v3.11.7/middleware.ts";
import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";
import { getOneRepoPackageJson } from "./utils/github/getOneRepoLibraries.ts";
import { Edge } from "./utils/github/getViewerRepos.ts";
import { statsRoute } from "./routes/stats/statsRoute.ts";
import { testRoute } from "./routes/test/testRoute.ts";
import { githubRoute } from "./routes/github/githubRoute.ts";
import { kvRoute } from "./routes/kv/kvRoute.ts";

const app = new Hono();

const db = await Deno.openKv();

db.listenQueue(async (msg) => {
  const data = msg as { message: string; value: Edge; viewer_token: string };

  if (!data.value) {
    return;
  }
  if (!data.message) {
    return;
  }

  if (data.message === "repo_pkgjson_queue") {
    if (!data.viewer_token || !data.value.node.nameWithOwner) {
      return;
    }

    const pkgjson = await getOneRepoPackageJson(
      data.value.node.nameWithOwner,
      data.viewer_token,
    );
    if (!pkgjson) return;
    if ("documentation_url" in pkgjson || "message" in pkgjson) return;
    // const db = await Deno.openKv("https://api.deno.com/databases/80135a8a-6c16-4f9f-ae52-5100637fed23/connect");
    // const external_kv = await Deno.openKv("https://api.deno.com/databases/80135a8a-6c16-4f9f-ae52-5100637fed23/connect");
    console.log("==== writing data to kv ==== ", {
      data,
      name: data.value.node.nameWithOwner,
      pkgjson,
    });
    // const db = await Deno.openKv();
    await db.set(["repo_pkgjson", data.value.node.nameWithOwner], pkgjson);
  }

  return;
});

app.use("*", logger(), poweredBy());

app.use("*", async (c, next) => {
  const headers = c.req.raw.headers;
  const gh_token = headers.get("Authorization");
  if (!gh_token) {
    return c.text("PAT required", 401);
  }
  await next();
  // c.req.headers.set('x-message', 'This is middleware!')
});

app.get("/", (c) => {
  return c.text("Hello Deno! , available route : /stats, /test, /github, /kv");
});

app.route("/stats", statsRoute);
app.route("/test", testRoute);
app.route("/kv", kvRoute);
app.route("/github", githubRoute);

Deno.serve(app.fetch);
