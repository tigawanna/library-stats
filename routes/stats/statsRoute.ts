import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";
import { getPKGStatsRoute } from "./helpers/getLibStatswithQueues.ts";
import { getFreshComputeRoute } from "./helpers/computeLibStats.ts";

const statsRoute = new Hono();
statsRoute.get("/stats", (c) => {
  return getPKGStatsRoute(c);
});

statsRoute.get("/stats/enqueue_compute", (c) => {
  return getFreshComputeRoute(c);
});

export { statsRoute };
