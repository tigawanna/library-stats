import { Context } from "https://deno.land/x/hono@v3.11.7/context.ts";
import { Env } from "https://deno.land/x/hono@v3.11.7/types.ts";
import { app } from "../hono.ts";


export async function getTestRoute(c: Context<Env, "/test", Record<string | number | symbol, never>>) {
    const kv = await Deno.openKv();
    const headers = c.req.raw.headers
    const gh_token = headers.get('Authorization')
    console.log({headers, gh_token})
    return c.text('Test Hello Deno!')

}
