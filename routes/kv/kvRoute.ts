import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";
import { getGithubViewer } from "../../utils/github/getViewer.ts";

const kvRoute = new Hono();

kvRoute.get(
  "/",
  (c) => c.text("KV route : /list: to get all ,\n /clear: to clear all"),
);

kvRoute.get("/list", async (c) => {
  try {
    const { key } = c.req.query() as { key: string };
    if (!key) {
      return c.text("key  param is required");
    }
    const kv = await Deno.openKv();
    // const key = "repo_pkgjson"
    // const kv = await Deno.openKv("https://api.deno.com/databases/80135a8a-6c16-4f9f-ae52-5100637fed23/connect");
    console.log("listing items under key with prefix ", key);
    const data = await Array.fromAsync(kv.list({ prefix: [key] }));
    console.log("Items length :", data.length);
    return c.json({ data });
  } catch (error) {
    return c.text("error listing: ", error.message);
  }
});
kvRoute.get("/clear", async (c) => {
  try {
    const headers = c.req.raw.headers;
    const gh_token = headers.get("Authorization");
    if (!gh_token) {
      return c.text("PAT required", 401);
    }
    const viewer = await getGithubViewer(gh_token);
    if (viewer.login !== "tigawanna") {
      return c.text("Who are you?", 401);
    }
    const { key } = c.req.query() as { key: string };
    if (!key) {
      return c.text("key param is required");
    }
    const kv = await Deno.openKv();
    // const kv = await Deno.openKv("https://api.deno.com/databases/80135a8a-6c16-4f9f-ae52-5100637fed23/connect");
    console.log("deleting items under key with prefix ", key);
    const data = await Array.fromAsync(kv.list({ prefix: [key] }));
    for await (const item of data) {
      console.log("deleting ", item.key);
      await kv.delete(item.key);
    }
    return c.text("deleted successfully");
  } catch (error) {
    return c.text("error deleting : ", error.message);
  }
});

export { kvRoute };
