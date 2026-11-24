import { BaseStaticRepo, db } from "../../core/db";
import { UserRepo } from "../user/repo";
import { UserCustomBadge, UserCustomBadgeMap } from "./types";

export abstract class UserCustomBadgeRepo extends BaseStaticRepo {
  static override prefix = "userCustomBadge";

  static async create(badge: UserCustomBadge) {
    return await super.setEntry<UserCustomBadge, UserCustomBadge>(badge.badgeId, badge);
  }

  static async get(badgeId: string) {
    return await super.getEntry<UserCustomBadge>(badgeId);
  }

  static async delete(badgeId: string) {
    return await db.remove(`${this.prefix}:${badgeId}`);
  }

  static async getAll() {
    const prefix = `${this.prefix}:`;
    const badges: UserCustomBadge[] = [];

    for (const { key, value } of db.getRange({ start: prefix })) {
      if (typeof key !== "string" || !key.startsWith(prefix)) {
        break;
      }

      const entry = value as Partial<UserCustomBadge> | undefined;
      if (typeof entry?.badgeId !== "string" || typeof entry.text !== "string") {
        continue;
      }

      badges.push({ badgeId: entry.badgeId, text: entry.text });
    }

    return badges.sort((a, b) => a.badgeId.localeCompare(b.badgeId, undefined, { numeric: true }));
  }
}

export abstract class UserCustomBadgeMapRepo extends BaseStaticRepo {
  static override prefix = "userCustomBadgeMap";

  static async getAll(userId: number) {
    const assignment = await super.getEntry<UserCustomBadgeMap>(userId);
    const ids = assignment?.badgeId ?? [];
    const entries = await Promise.all(ids.map((id) => UserCustomBadgeRepo.get(id)));

    return {
      userId,
      badges: entries.filter((badge): badge is UserCustomBadge => badge !== undefined),
    };
  }

  static async getUniqueUsers(onlyActive = false) {
    const prefix = `${this.prefix}:`;
    const users: number[] = [];
    const existsBadgeIds = onlyActive
      ? (await UserCustomBadgeRepo.getAll()).map((badge) => badge.badgeId)
      : null;

    for (const { key, value } of db.getRange({ start: prefix })) {
      if (typeof key !== "string" || !key.startsWith(prefix)) {
        break;
      }

      const ids = (value as UserCustomBadgeMap | undefined)?.badgeId ?? [];
      if (!ids.length || (existsBadgeIds && !ids.some((id) => existsBadgeIds.includes(id)))) {
        continue;
      }

      const userId = Number.parseInt(key.split(":")[1], 10);
      if (!Number.isNaN(userId)) {
        users.push(userId);
      }
    }

    return Array.from(new Set(users));
  }

  static async getUniqueUsersWithInfo(offset: number = 0, pageSize: number = 10) {
    const users = await this.getUniqueUsers(true);
    const slicedUsers = users.slice(offset, offset + pageSize);
    const userInfoList = await Promise.all(
      slicedUsers.map(async (userId) => {
        const userInfo = await UserRepo.get(userId);
        if (!userInfo) {
          return {
            userId,
            username: undefined,
          };
        }

        return {
          userId,
          username: userInfo.value.username,
        };
      }),
    );

    return {
      users: userInfoList,
      hasNext: users.length > offset + pageSize,
    };
  }

  static async getUserIdsByBadge(badgeId: string): Promise<number[]> {
    const prefix = `${this.prefix}:`;
    const userIds = new Set<number>();

    for (const { key, value } of db.getRange({ start: prefix })) {
      if (typeof key !== "string" || !key.startsWith(prefix)) {
        break;
      }

      const data = value as UserCustomBadgeMap | undefined;
      if (!data || !Array.isArray(data.badgeId)) {
        continue;
      }

      if (data.badgeId.includes(badgeId)) {
        userIds.add(data.userId);
      }
    }

    return [...userIds].sort((a, b) => a - b);
  }

  private static async updateBadgeIds(
    userId: number,
    update: (ids: readonly string[]) => string[] | undefined,
  ): Promise<boolean> {
    const key = `${this.prefix}:${userId}`;
    let changed = false;

    await db.withLock(key, async () => {
      const current = await db.get<UserCustomBadgeMap>(key);
      const nextIds = update(current?.badgeId ?? []);
      if (nextIds === undefined) {
        return;
      }

      if (nextIds.length === 0) {
        await db.remove(key);
      } else {
        await db.put(key, {
          id: userId,
          userId,
          badgeId: nextIds,
        });
      }

      changed = true;
    });

    return changed;
  }

  static async set(userId: number, badgeId: string) {
    return this.updateBadgeIds(userId, (ids) =>
      ids.includes(badgeId) ? undefined : [...ids, badgeId],
    );
  }

  static async delete(userId: number, badgeId: string) {
    return this.updateBadgeIds(userId, (ids) =>
      ids.includes(badgeId) ? ids.filter((id) => id !== badgeId) : undefined,
    );
  }

  static async deleteBadgeId(badgeId: string) {
    const users = await this.getUniqueUsers();
    await Promise.all(users.map((userId) => this.delete(userId, badgeId)));
    return true;
  }
}
