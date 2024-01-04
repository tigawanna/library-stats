import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";

const testRoute = new Hono();

testRoute.get("/", (c) => c.json("list books"));
testRoute.post("/", (c) => c.json("create a book", 201));
testRoute.get("/:id", (c) => c.json(`get ${c.req.param("id")}`));

export { testRoute };
