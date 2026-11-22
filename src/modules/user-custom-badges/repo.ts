import { BaseStaticRepo } from "../../core/db";
import { UserCustomBadge } from "./types";

export abstract class UserCustomBadgeRepo extends BaseStaticRepo {
  static override prefix = "userCustomBadge";

  // static async getUserCustomBadge(userId: number) {
  //   return await super.getEntry<UserCustomBadge>(userId);
  // }

  // static async getBadgeInfo(badgeId: number) {
  //   return await super.getEntry<UserCustomBadge>(badgeId);
  // }

  // static async setToUser(userId: number, badgeId: number) {
  //   return await super.setEntry<number, UserCustomBadge>(userId, badgeId);
  // }

  static async create(badge: UserCustomBadge) {
    return await super.setEntry<UserCustomBadge, UserCustomBadge>(badge.badgeId, badge);
  }

  static async get(badgeId: number) {
    return await super.getEntry<UserCustomBadge>(badgeId);
  }
}
