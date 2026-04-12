import "dotenv/config";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to apply migrations.");
}

const sql = neon(connectionString);

function parseStatements(rawSql: string) {
  const statements: string[] = [];
  const current: string[] = [];

  for (const line of rawSql.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("--")) {
      continue;
    }

    current.push(line);

    if (trimmedLine.endsWith(";")) {
      statements.push(current.join("\n").replace(/;\s*$/, "").trim());
      current.length = 0;
    }
  }

  if (current.length > 0) {
    statements.push(current.join("\n").trim());
  }

  return statements.filter(Boolean);
}

async function main() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS "_CustomMigrations" (
      "name" TEXT PRIMARY KEY,
      "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const [{ userTable }] = await sql`SELECT to_regclass('"User"') AS "userTable"`;
  const migrationsRoot = path.join(process.cwd(), "prisma", "migrations");
  const migrationDirectories = (await readdir(migrationsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const appliedMigrations = new Set(
    (
      await sql`SELECT "name" FROM "_CustomMigrations" ORDER BY "name"`
    ).map((entry) => entry.name),
  );

  if (userTable && !appliedMigrations.has("20260411200000_init_neon_postgres")) {
    await sql`
      INSERT INTO "_CustomMigrations" ("name")
      VALUES (${"20260411200000_init_neon_postgres"})
      ON CONFLICT ("name") DO NOTHING
    `;
    appliedMigrations.add("20260411200000_init_neon_postgres");
  }

  let appliedCount = 0;

  for (const migrationName of migrationDirectories) {
    if (appliedMigrations.has(migrationName)) {
      continue;
    }

    const migrationPath = path.join(
      migrationsRoot,
      migrationName,
      "migration.sql",
    );
    const rawSql = await readFile(migrationPath, "utf8");
    const statements = parseStatements(rawSql);

    for (const statement of statements) {
      await sql.query(statement);
    }

    await sql`
      INSERT INTO "_CustomMigrations" ("name")
      VALUES (${migrationName})
      ON CONFLICT ("name") DO NOTHING
    `;
    appliedCount += 1;
  }

  console.log(
    JSON.stringify(
      {
        appliedMigrations: appliedCount,
        knownMigrations: migrationDirectories.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
