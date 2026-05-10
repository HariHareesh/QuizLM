import { ZodError } from "zod";
import { ConfigSchema, type Config } from "./types";
import { config as envConfig } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const globalCacher = global as {
    config?: Config;
}

export function getConfig(): Config {
    try {
        if (globalCacher.config) {
            return globalCacher.config;
        }        
        const envPath = resolve(__dirname, "../../../.env");
        if (existsSync(envPath)) {
            envConfig({ path: envPath });
        } else {
            console.warn(`.env file not found at ${envPath}. Using environment variables.`);
        }

        const env = process.env as any;
        let config: Config = {
            env: env.NODE_ENV || "development",
            express: {
                port: parseInt(env.EXPRESS_PORT || undefined),
                url: env.EXPRESS_URL,
            },
            nextUrl: env.NEXT_URL,
            db: {
                user: env.DB_USER,
                password: env.DB_PASSWORD,
                database: env.DB_NAME,
                host: env.DB_HOST,
                port: parseInt(env.DB_PORT || undefined),
                url: env.DB_URL
            },
            clerk: {
                publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
                secretKey: env.CLERK_SECRET_KEY,
                webhookSecret: env.CLERK_WEBHOOK_SECRET
            },
            geminiApiKey: env.GEMINI_API_KEY
        }
        config = ConfigSchema.parse(config);
        globalCacher.config = config;
        return config;
    } catch (e: any) {
        if (e instanceof ZodError) {
            throw new Error(`Failed to load configuration. Please check the environment variables. ${e.message}`);
        }
        throw e;
    }
}

export { ZodError } from "zod";