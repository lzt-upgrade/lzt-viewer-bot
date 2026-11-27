import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`PRAGMA journal_mode = WAL`.execute(db);

  await db.schema
    .createTable("remark")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull().unique())
    .addColumn("createdAt", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createTable("user_remarks")
    .addColumn("remarkId", "integer", (col) => col.notNull())
    .addColumn("userId", "integer", (col) => col.notNull())
    .addForeignKeyConstraint("remarkId_foreign", ["remarkId"], "remark", ["id"], (cb) =>
      cb.onDelete("cascade"),
    )
    .addUniqueConstraint("unique_user_remark", ["remarkId", "userId"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user_remarks").execute();
  await db.schema.dropTable("remark").execute();
}
