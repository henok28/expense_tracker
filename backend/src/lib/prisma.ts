import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

// const databseUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DATABASE}`;
const databseUrl = process.env["DATABASE_URL"];

if (!databseUrl) {
  throw new Error("database url not found");
}

const prismaConfig = {
  adapter: new PrismaPg({ connectionString: databseUrl }),
};

export const prisma = new PrismaClient(prismaConfig);
