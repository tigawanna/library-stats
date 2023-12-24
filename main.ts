import { logger, poweredBy } from 'https://deno.land/x/hono@v3.11.7/middleware.ts'
import { Hono } from 'https://deno.land/x/hono@v3.11.7/mod.ts'
import { getTestRoute } from "./routes/test/index.ts";
import { getRepoOwner } from "./routes/github/owner.ts";

const app = new Hono()

app.use('*', logger(), poweredBy())
app.get('/', (c) => {
    return c.text('Hello Deno!')
})
app.get('/test', (c) => {
    return getTestRoute(c)
})
app.get('/owner', (c) => {
    return getRepoOwner(c)
})


Deno.serve(app.fetch)
