import { nanoid } from "nanoid";

import { UserCustomBadgeMapRepo, UserCustomBadgeRepo } from "./repo";
import { UserRepo } from "../user/repo";

export abstract class UserCustomBadgeService {
  static async delete(badgeId: string) {
    return await UserCustomBadgeRepo.delete(badgeId);
  }

  static async create(text: string) {
    return await UserCustomBadgeRepo.create({
      text,
      badgeId: nanoid(),
    });
  }

  static async getBadge(badgeId: string) {
    return await UserCustomBadgeRepo.get(badgeId);
  }

  static async addToUser(userId: number, badgeId: string) {
    const badge = await UserCustomBadgeRepo.get(badgeId);
    if (!badge) {
      return undefined;
    }

    await UserCustomBadgeMapRepo.set(userId, badgeId);
    return badge;
  }

  static async getUserBadges(userId: number) {
    const assignments = await UserCustomBadgeMapRepo.getAll(userId);
    if (!assignments.badges.length) {
      return undefined;
    }

    const allBadges = await UserCustomBadgeRepo.getAll();
    return allBadges.filter((badge) => assignments.badges.some((a) => a.badgeId === badge.badgeId));
  }

  static async deleteBadgeFromUsers(badgeId: string) {
    return await UserCustomBadgeMapRepo.deleteBadgeId(badgeId);
  }

  static async takeoffFromUser(userId: number, badgeId: string) {
    return await UserCustomBadgeMapRepo.delete(userId, badgeId);
  }

  static async getUsersByBadge(badgeId: string, offset = 0, pageSize = 10) {
    const badge = await UserCustomBadgeRepo.get(badgeId);
    const userIds = badge ? await UserCustomBadgeMapRepo.getUserIdsByBadge(badgeId) : [];
    const end = offset + pageSize;

    const users = await Promise.all(
      userIds.slice(offset, end).map(async (userId) => {
        const cached = await UserRepo.get(userId);
        return { userId, username: cached?.value.username };
      }),
    );

    return { users, hasNext: end < userIds.length };
  }
}
