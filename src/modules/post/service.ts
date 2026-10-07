import { isExpired } from "../../core/db";
import { PostRepo } from "./repo";
import { lzt } from "../../core/lzt";
import { getMemberPerma, getPostLikesPerma, getPostPerma, getThreadPerma } from "../../api/utils";
import { CreatePostData } from "./types";

export abstract class PostService {
  static async get(postId: number) {
    const saved = await PostRepo.get(postId);
    if (saved && !isExpired(saved)) {
      return saved.value;
    }

    try {
      const {
        user_id: ownerId,
        username,
        post_date: createdAt,
        update_date: updatedAt,
        likes,
        thread_id: threadId,
        message: bbText,
        message_plain_text: plainText,
      } = await lzt.getPost(postId);

      const result = await this.set(postId, {
        thread: {
          id: threadId,
          link: getThreadPerma(threadId),
        },
        owner: {
          id: ownerId,
          username,
          link: getMemberPerma(ownerId),
        },
        bbText,
        plainText,
        createdAt,
        updatedAt,
        likes: {
          count: likes,
          link: getPostLikesPerma(postId),
        },
        link: getPostPerma(postId),
      });

      return result?.value;
    } catch {
      console.error("Failed to fetch post data from API, returning saved data if available");
    }

    if (!saved) {
      return undefined;
    }

    // extend lifetime of expired saved data if API request failed
    const result = await this.set(postId, saved.value);
    return result?.value;
  }

  static async set(postId: number, post: CreatePostData) {
    return await PostRepo.set(postId, post);
  }
}
