import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);

function resolvePrismaCli() {
  try {
    return require.resolve("prisma/build/index.js");
  } catch {
    return null;
  }
}

const prismaCli = resolvePrismaCli();

if (!prismaCli) {
  console.log("[postinstall] Prisma CLI not installed in this environment. Skipping prisma generate.");
  process.exit(0);
}

execFileSync(process.execPath, [prismaCli, "generate"], {
  stdio: "inherit",
  env: process.env,
});
