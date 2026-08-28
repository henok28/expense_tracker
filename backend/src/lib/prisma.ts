import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

const databseUrl = process.env["DATABASE_URL"];

if (!databseUrl) {
  throw new Error("database url not found");
}

const prismaConfig = {
  adapter: new PrismaPg({ connectionString: databseUrl }),
};

export const prisma = new PrismaClient(prismaConfig);
