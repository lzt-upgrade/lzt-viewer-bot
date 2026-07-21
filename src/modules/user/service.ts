import { isExpired } from "../../core/db";
import { UserRepo } from "./repo";
import { lzt } from "../../core/lzt";
import { CreateUserData } from "./types";
import {
  getMemberFollowersPerma,
  getMemberFollowingPerma,
  getMemberLikesPerma,
  getMemberMessagesPerma,
  getMemberPerma,
  getMemberSympathiesPerma,
  getMemberTrophiesPerma,
} from "../../api/utils";
import { predictGroup } from "./group";

export abstract class UserService {
  static async get(userIdOrSlug: number | string) {
    const saved = await UserRepo.get(userIdOrSlug);
    if (saved && !isExpired(saved)) {
      return saved.value;
    }

    try {
      const user = await lzt.getUser(userIdOrSlug);
      const {
        user_id: userId,
        username,
        user_message_count: messages,
        user_register_date: createdAt,
        user_like_count: sympathies,
        user_like2_count: likes,
        user_deposit: deposit,
        custom_title: status,
        short_link: slug,
        is_banned: banned,
        ban_reason: reason,
        ban: { author, ban_date: startDate, end_date: endDate } = {},
        contest_count: contests,
        trophy_count: trophies,
        user_following: { count: followings },
        user_followers: { count: followers },
        user_title: group,
        user_last_seen_date: lastSeenAt,
        fields,
      } = user;
      const predictedGroup = predictGroup(user);
      const telegramLink = fields.find(
        (field) => field.id === "telegram",
      )?.value;

      const data: CreateUserData = {
        username,
        status: status || "N/A",
        messages,
        deposit,
        sympathies,
        likes,
        slug,
        banInfo: {
          banned: Boolean(banned),
          reason,
          startDate,
          endDate,
          author,
        },
        contests,
        trophies,
        followers,
        followings,
        group,
        predictedGroup,
        createdAt,
        lastSeenAt,
        link: getMemberPerma(userId),
        links: {
          messages: getMemberMessagesPerma(username),
          sympathies: getMemberSympathiesPerma(userId),
          likes: getMemberLikesPerma(userId),
          trophies: getMemberTrophiesPerma(userId),
          followers: getMemberFollowersPerma(userId),
          followings: getMemberFollowingPerma(userId),
          telegram: telegramLink ? `https://t.me/${telegramLink}` : undefined,
        },
      };

      if (slug) {
        await this.set(slug, data);
      }
      const result = await this.set(userId, data);

      return result?.value;
    } catch {
      console.error(
        "Failed to fetch user data from API, returning saved data if available",
      );
    }

    if (!saved) {
      return undefined;
    }

    // extend lifetime of expired saved data if API request failed
    if (saved.value.slug) {
      await this.set(saved.value.slug, saved.value);
    }
    const result = await this.set(userIdOrSlug, saved.value);
    return result?.value;
  }

  static async set(userIdOrSlug: number | string, user: CreateUserData) {
    return await UserRepo.set(userIdOrSlug, user);
  }
}
