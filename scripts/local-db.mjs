// Optional no-Docker local Postgres for development/verification.
// Downloads and runs a self-contained Postgres on localhost:5432 (no admin,
// no Docker required). Keeps running until you press Ctrl+C.
//
// Usage: node scripts/local-db.mjs
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import path from "node:path";

const dataDir = path.resolve(process.cwd(), ".pgdata");
const isFirstRun = !existsSync(dataDir);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port: 5432,
  persistent: true,
});

if (isFirstRun) {
  console.log("Initialising local Postgres data directory…");
  await pg.initialise();
}

await pg.start();

if (isFirstRun) {
  await pg.createDatabase("ajaia_docs");
  console.log('Created database "ajaia_docs".');
}

console.log("Local Postgres is running on postgresql://postgres:postgres@localhost:5432/ajaia_docs");
console.log("Press Ctrl+C to stop.");

async function shutdown() {
  console.log("\nStopping local Postgres…");
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
