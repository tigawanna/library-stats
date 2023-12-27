import { logger, poweredBy } from 'https://deno.land/x/hono@v3.11.7/middleware.ts'
import { Hono } from 'https://deno.land/x/hono@v3.11.7/mod.ts'
import { getTestRoute } from "./routes/test/index.ts";
import { getTestReadKVRoute } from "./routes/test/readkv.ts";
import { getTestPkgRoute } from "./routes/test/pkgtype.ts";


const app = new Hono()

app.use('*', logger(), poweredBy())
app.get('/', (c) => {
    return c.text('Hello Deno!')
})
app.get('/test', (c) => {
    return getTestRoute(c)
})
app.get('/test/kv', (c) => {
    return getTestReadKVRoute(c)
})
app.get('/test/pkg', (c) => {
    return getTestPkgRoute(c)
})


Deno.serve(app.fetch)
