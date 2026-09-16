import { isExpired } from "../../core/db";
import { UserRepo } from "./repo";
import { lzt } from "../../core/lzt";
import { CreateUserData } from "./types";
import {
  getMarketProfilePerma,
  getMemberFollowersPerma,
  getMemberFollowingPerma,
  getMemberLikesPerma,
  getMemberMessagesPerma,
  getMemberPerma,
  getMemberSympathiesPerma,
  getMemberTrophiesPerma,
  getUserReportsThreads,
} from "../../api/utils";
import { predictGroup } from "./group";
import {
  predictRemarks,
  predictReports,
  predictReviews,
  predictSells,
  predictViews,
} from "../user-trophies/utils";
import { UserTrophiesService } from "../user-trophies/service";

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
        links: { avatar_big: avatarUrl },
        contest_count: contests,
        trophy_count: trophies,
        user_following: { count: followings },
        user_followers: { count: followers },
        user_title: group,
        user_last_seen_date: lastSeenAt,
        fields,
      } = user;
      const predictedGroup = predictGroup(user);
      const telegramLink = fields.find((field) => field.id === "telegram")?.value;

      const userTrophies = await UserTrophiesService.get(userId);
      const data: CreateUserData = {
        username,
        status: status || "N/A",
        messages,
        deposit,
        sympathies,
        likes,
        views: predictViews(userTrophies),
        sells: predictSells(userTrophies),
        reviews: predictReviews(userTrophies),
        reports: predictReports(userTrophies),
        remarks: predictRemarks(userTrophies),
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
          market: getMarketProfilePerma(userId),
          reports: getUserReportsThreads(userId),
          telegram: telegramLink ? `https://t.me/${telegramLink}` : undefined,
          avatarUrl,
        },
      };

      if (slug) {
        await this.set(slug, data);
      }
      const result = await this.set(userId, data);

      return result?.value;
    } catch (err) {
      console.error("Failed to fetch user data from API, returning saved data if available", err);
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
