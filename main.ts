import {
  logger,
  poweredBy,
} from "https://deno.land/x/hono@v3.11.7/middleware.ts";
import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";
import { getPKGStatsRoute } from "./routes/lib-stats/getLibStats.ts";
import { getFreshComputeRoute } from "./routes/lib-stats/getFreshComputeRoute.ts";
import { load } from "https://deno.land/std@0.210.0/dotenv/mod.ts";

const app = new Hono();

const db = await Deno.openKv();
db.listenQueue(async (msg) => {
  const data = msg as { channel: string; text: string };
  console.log("=== QUEUE MESSAGE === ", data);
  await db.set(["test-queues", data.channel], data.text);
});

app.use("*", logger(), poweredBy());
app.get("/", (c) => {
  return c.text("Hello Deno!");
});
app.get("/stats", (c) => {
  return getPKGStatsRoute(c);
});

app.get("/stats/fresh_compute", (c) => {
  return getFreshComputeRoute(c);
});


app.get('/test', async(c) => {
  try {
    const env = await load();
    const db = await Deno.openKv();

    // db.listenQueue(async(msg) => {
    //   const data = msg as { channel: string; text: string };
    //   console.log("=== QUEUE MESSAGE === ",data);
    //   await db.set(["test-queues", data.channel], data.text);
    // });

    await db.enqueue({ channel: "C123456", text: "Slack message" }, {
      delay: 0,
    });
    return c.json({
      env,
    })
  } catch (error) {
    return c.text("error  with queues === "+error.message, 401);
  }
})
// app.get('/test/kv', (c) => {
//     return getTestReadKVRoute(c)
// })
// app.get('/test/pkg', (c) => {
//     return getTestPkgRoute(c)
// })

Deno.serve(app.fetch);
