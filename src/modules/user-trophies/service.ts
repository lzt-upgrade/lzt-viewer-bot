import { isExpired } from "../../core/db";
import { lzt } from "../../core/lzt";
import { UserTrophy } from "../../types/api/user-trophies";
import { UserTrophiesRepo } from "./repo";

export abstract class UserTrophiesService {
  static async get(userIdOrSlug: number | "me") {
    const saved = await UserTrophiesRepo.get(userIdOrSlug);
    if (saved && !isExpired(saved)) {
      return saved.value;
    }

    try {
      const userTrophies = await lzt.getUserTrophies(userIdOrSlug);
      const result = await this.set(userIdOrSlug, userTrophies);
      return result?.value;
    } catch {
      console.error("Failed to fetch user trophies from API, returning saved data if available");
    }

    if (!saved) {
      return undefined;
    }

    // extend lifetime of expired saved data if API request failed
    const result = await this.set(userIdOrSlug, saved.value);
    return result?.value;
  }

  static async set(userIdOrSlug: number | "me", trophies: UserTrophy[]) {
    return await UserTrophiesRepo.set(userIdOrSlug, trophies);
  }
}
