import { getTimestamp } from "../../api/utils";
import { BaseRepo, db } from "../../core/db";
import { UserTrophy } from "../../types/api/user";
import { DBEntry } from "../../types/db";

export abstract class UserTrophiesRepo extends BaseRepo {
  static override prefix = "user_trophies";

  static async get(id: number | "me") {
    return await super.getEntry<UserTrophy[]>(id);
  }

  protected static async setEntry<NewValue, Value>(
    id: number | "me",
    value: NewValue,
  ): Promise<DBEntry<Value> | undefined> {
    const key = `${this.prefix}:${id}`;
    await db.withLock(key, async () => {
      await db.put(key, {
        value,
        expiresAt: getTimestamp() + this.ttl,
      });
    });
    return await this.getEntry<Value>(id);
  }

  static async set(id: number | "me", value: UserTrophy[]) {
    return await this.setEntry<UserTrophy[], UserTrophy[]>(id, value);
  }
}
