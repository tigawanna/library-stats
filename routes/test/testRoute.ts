import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";

const testRoute = new Hono();

testRoute.get("/", (c) => c.json("/test route"));

testRoute.get("/q", async(c) => {
const kv = await Deno.openKv();
    // console.log("=== DELAY === ", delay);
    type GreetingData = {
        message: "greeting"
        value: "hello"
    }
    const data:GreetingData = {
        message:"greeting",
        value:"hello"
    }

    const qq = await kv.enqueue(data);
    console.log({qq})
return c.json("list ")
});

export { testRoute };
