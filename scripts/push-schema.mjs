#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const PROJECT_REF = "qjwatcktobybdmdwgymi";
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const dbUrl = process.env.DATABASE_URL?.trim();

function run(args) {
  const result = spawnSync("npx", ["--yes", "supabase", ...args], {
    stdio: "inherit",
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

if (dbUrl) {
  run(["db", "push", "--db-url", dbUrl, "--yes"]);
}

if (token) {
  const login = spawnSync(
    "npx",
    ["--yes", "supabase", "login", "--token", token],
    { stdio: "inherit", env: process.env },
  );
  if (login.status) {
    process.exit(login.status);
  }
  run(["db", "push", "--project-ref", PROJECT_REF, "--yes"]);
}

console.error(`No database credentials found.

Apply the schema in one of these ways:
1. Open http://localhost:3000/setup and paste the SQL into the hosted SQL editor
2. Set SUPABASE_ACCESS_TOKEN and run: npm run schema:push
3. Set DATABASE_URL (direct Postgres URL with the database password) and run: npm run schema:push
`);
process.exit(1);
