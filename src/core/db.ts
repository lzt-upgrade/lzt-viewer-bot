import { MaybePromise } from "bun";
import { Key, RocksDatabase } from "@harperfast/rocksdb-js";
import { DBEntry } from "../types/db";
import { getTimestamp } from "../api/utils";

class TypedRocksDatabase extends RocksDatabase {
  get<T>(
    key: Key,
    options?: Parameters<typeof RocksDatabase.prototype.get>[1],
  ) {
    return super.get(key, options) as MaybePromise<T | undefined>;
  }
}

export const db: TypedRocksDatabase = TypedRocksDatabase.open("db-data");

export const isExpired = <T>(entry: DBEntry<T>) => {
  return entry.expiresAt < getTimestamp();
};

export abstract class BaseRepo {
  static prefix = "base";
  static ttl = 60; // 1 min in seconds

  protected static async getEntry<Value>(
    id: number | string,
  ): Promise<DBEntry<Value> | undefined> {
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
