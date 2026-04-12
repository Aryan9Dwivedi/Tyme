import "dotenv/config";

import { readFile } from "node:fs/promises";
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
  const [{ userTable }] = await sql`SELECT to_regclass('"User"') AS "userTable"`;

  if (userTable) {
    console.log("Schema already exists in Neon. Skipping migration apply.");
    return;
  }

  const migrationPath = path.join(
    process.cwd(),
    "prisma",
    "migrations",
    "20260411200000_init_neon_postgres",
    "migration.sql",
  );
  const rawSql = await readFile(migrationPath, "utf8");
  const statements = parseStatements(rawSql);

  for (const statement of statements) {
    await sql.query(statement);
  }

  console.log(
    JSON.stringify(
      {
        appliedStatements: statements.length,
        migration: path.basename(path.dirname(migrationPath)),
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
