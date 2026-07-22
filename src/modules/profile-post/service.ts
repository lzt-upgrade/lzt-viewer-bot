import { isExpired } from "../../core/db";
import { ProfilePostRepo } from "./repo";
import { lzt } from "../../core/lzt";
import {
  getMemberPerma,
  getProfilePostCommentsPerma,
  getProfilePostLikesPerma,
  getProfilePostPerma,
} from "../../api/utils";
import { CreateProfilePostData } from "./types";

export abstract class ProfilePostService {
  static async get(profilePostId: number) {
    const saved = await ProfilePostRepo.get(profilePostId);
    if (saved && !isExpired(saved)) {
      return saved.value;
    }

    try {
      const data = await lzt.getProfilePost(profilePostId);
      const {
        poster_user_id: ownerId,
        poster_username: username,
        post_create_date: createdAt,
        post_like_count: likes,
        post_comment_count: comments,
        post_body: bbText,
        post_body_plain_text: plainText,
        timeline_user_id: profileId,
        timeline_username: profileUsername,
      } = data;

      const result = await this.set(profilePostId, {
        owner: {
          id: ownerId,
          username,
          link: getMemberPerma(ownerId),
        },
        profile: {
          id: profileId,
          username: profileUsername,
          link: getMemberPerma(profileId),
        },
        bbText,
        plainText,
        createdAt,
        likes: {
          count: likes,
          link: getProfilePostLikesPerma(profilePostId),
        },
        comments: {
          count: comments,
          link: getProfilePostCommentsPerma(profilePostId),
        },
        link: getProfilePostPerma(profilePostId),
      });

      return result?.value;
    } catch {
      console.error(
        "Failed to fetch profile post data from API, returning saved data if available",
      );
    }

    if (!saved) {
      return undefined;
    }

    // extend lifetime of expired saved data if API request failed
    const result = await this.set(profilePostId, saved.value);
    return result?.value;
  }

  static async set(profilePostId: number, profilePost: CreateProfilePostData) {
    return await ProfilePostRepo.set(profilePostId, profilePost);
  }
}
