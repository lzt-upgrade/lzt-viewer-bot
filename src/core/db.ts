import path from "node:path";
import { MaybePromise } from "bun";
import { Key, RocksDatabase } from "@harperfast/rocksdb-js";
import { BunWorkerDialect } from "kysely-bun-worker";
import { CompiledQuery, Kysely } from "kysely";
import type { RemarkTable, UserRemarkTable } from "../modules/remark/sctema";

import { DBEntry } from "../types/db";
import { getTimestamp } from "../api/utils";

class TypedRocksDatabase extends RocksDatabase {
  get<T>(key: Key, options?: Parameters<typeof RocksDatabase.prototype.get>[1]) {
    return super.get(key, options) as MaybePromise<T | undefined>;
  }
}

export const db: TypedRocksDatabase = TypedRocksDatabase.open("db-data");
const dialect = new BunWorkerDialect({
  url: path.join(__dirname, "..", "..", "persist.db"),
  async onCreateConnection(connection) {
    await connection.executeQuery(CompiledQuery.raw("PRAGMA foreign_keys = ON"));
  },
});

export type Database = {
  remark: RemarkTable;
  user_remarks: UserRemarkTable;
};

export const adminDb = new Kysely<Database>({
  dialect,
});

export const isExpired = <T>(entry: DBEntry<T>) => {
  return entry.expiresAt < getTimestamp();
};

export abstract class BaseRepo {
  static prefix = "base";
  static ttl = 60; // 1 min in seconds

  protected static async getEntry<Value>(id: number | string): Promise<DBEntry<Value> | undefined> {
    return await db.get<DBEntry<Value>>(`${this.prefix}:${id}`);
  }

  protected static async setEntry<NewValue, Value>(
    id: number | string,
    value: NewValue,
  ): Promise<DBEntry<Value> | undefined> {
    const key = `${this.prefix}:${id}`;
    await db.withLock(key, async () => {
      await db.put(key, {
        value: {
          id: id,
          ...value,
        },
        expiresAt: getTimestamp() + this.ttl,
      });
    });
    return await this.getEntry<Value>(id);
  }
}

export abstract class BaseStaticRepo {
  static prefix = "base-static";

  protected static async getEntry<Value>(id: number | string): Promise<Value | undefined> {
    return await db.get<Value>(`${this.prefix}:${id}`);
  }

  protected static async setEntry<NewValue, Value>(
    id: number | string,
    value: NewValue,
  ): Promise<Value | undefined> {
    const key = `${this.prefix}:${id}`;
    await db.withLock(key, async () => {
      await db.put(key, {
        id,
        ...value,
      });
    });
    return await this.getEntry<Value>(id);
  }
}
