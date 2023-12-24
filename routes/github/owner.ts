import { Context } from "https://deno.land/x/hono@v3.11.7/context.ts";
import { Env } from "https://deno.land/x/hono@v3.11.7/types.ts";
import { getGithubViewer } from "./helpers.ts";



export async function getRepoOwner(c: Context<Env, "/owner", Record<string | number | symbol, never>>) {

    const headers = c.req.raw.headers
    const gh_token = headers.get('Authorization')
    if(!gh_token) {
        return c.text('PAT required', 401)
    }
    const repo_owner = await getGithubViewer(gh_token)
    console.log({ gh_token, repo_owner })
    return c.json(repo_owner)

}
