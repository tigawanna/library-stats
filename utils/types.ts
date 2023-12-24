import { z } from "zod";

const envVariables = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    GH_PAT:z.string(),
    ATLAS_PWD:z.string(),
})

envVariables.parse(process.env)

declare global {
    namespace NodeJS {
        interface ProcessEnv 
        extends z.infer<typeof envVariables> {}
    }
}


export class CustomError extends Error {
    cause?: Error;
    constructor(message: string, cause?: Error) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.cause = cause;
    }
}
