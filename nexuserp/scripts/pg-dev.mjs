// Dev-only embedded PostgreSQL. Real Postgres binaries, no admin/Docker needed.
// Starts on localhost:5432 (matches DATABASE_URL) and stays running until killed.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const dataDir = resolve(process.cwd(), ".pgdata");
const fresh = !existsSync(dataDir);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "password",
  port: 5432,
  persistent: true,
});

if (fresh) {
  console.log("Initialising Postgres data dir…");
  await pg.initialise();
}

await pg.start();
console.log("Postgres started on localhost:5432");

try {
  await pg.createDatabase("nexuserp");
  console.log("Database 'nexuserp' created");
} catch {
  console.log("Database 'nexuserp' already exists");
}

// Keep alive; stop cleanly on signals.
const stop = async () => {
  console.log("Stopping Postgres…");
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
console.log("Ready. Leave this running.");
