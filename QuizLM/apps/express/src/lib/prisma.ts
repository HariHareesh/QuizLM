import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { getConfig } from "@repo/shared/server";
import { PrismaClient } from "@repo/db";

const dbConfig = getConfig().db;
const connectionString = `postgresql://${dbConfig.user}:${encodeURIComponent(dbConfig.password)}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;

const adapter = new PrismaPg({ connectionString });


const prisma = new PrismaClient({ adapter });

export { prisma };