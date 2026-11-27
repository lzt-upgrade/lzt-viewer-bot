import path from "node:path";
import fs from "node:fs/promises";
import { Migrator, FileMigrationProvider } from "kysely/migration";

import { adminDb } from "./core/db";

const action = Bun.env.MIGRATOR_ACTION ?? "upgrade";

async function migrate() {
  console.info("Starting migration...");
  const migrator = new Migrator({
    db: adminDb,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "migrations"),
    }),
  });

  const { error, results } =
    action === "upgrade" ? await migrator.migrateToLatest() : await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.info(
        `Migration "${it.migrationName}" was ${
          action === "upgrade" ? "executed" : "downgraded"
        } successfully`,
      );
    } else if (it.status === "Error") {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("Failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await adminDb.destroy();
}

await migrate();
