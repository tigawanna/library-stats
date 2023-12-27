import {
  logger,
  poweredBy,
} from "https://deno.land/x/hono@v3.11.7/middleware.ts";
import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";
import { getPKGStatsRoute } from "./routes/lib-stats/getLibStats.ts";
import { getFreshComputeRoute } from "./routes/lib-stats/getFreshComputeRoute.ts";

const app = new Hono();

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

// app.get('/test', (c) => {
//     return getTestRoute(c)
// })
// app.get('/test/kv', (c) => {
//     return getTestReadKVRoute(c)
// })
// app.get('/test/pkg', (c) => {
//     return getTestPkgRoute(c)
// })

Deno.serve(app.fetch);
