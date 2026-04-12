import "dotenv/config";

import { defineConfig } from "prisma/config";

// Vercel installs may only provide DATABASE_URL during prisma generate.
const prismaDatasourceUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/tyme?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: prismaDatasourceUrl,
  },
});
