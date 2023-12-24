import { logger, poweredBy } from 'https://deno.land/x/hono@v3.11.7/middleware.ts'
import { Hono } from 'https://deno.land/x/hono@v3.11.7/mod.ts'
import { getTestRoute } from "./routes/test/index.ts";
import { getRepoOwner } from "./routes/github/owner.ts";
import { getOneRepolibStats } from "./routes/github/one-repo-lib-stats.ts";

const app = new Hono()

app.use('*', logger(), poweredBy())
app.get('/', (c) => {
    return c.text('Hello Deno!')
})
app.get('/test', (c) => {
    return getTestRoute(c)
})
app.get('/github/owner', (c) => {
    return getRepoOwner(c)
})
app.get('/github/lib-stats', (c) => {
    return getOneRepolibStats(c)
})


Deno.serve(app.fetch)
