import { isExpired } from "../../core/db";
import { ThreadRepo } from "./repo";
import { lzt } from "../../core/lzt";
import { CreateThreadData } from "./types";
import { getForumsPerma, getMemberPerma, getThreadPerma } from "../../api/utils";

export abstract class ThreadService {
  static async get(threadId: number) {
    const saved = await ThreadRepo.get(threadId);
    if (saved && !isExpired(saved)) {
      return saved.value;
    }

    try {
      const {
        forum_id: nodeId,
        thread_title: title,
        creator_user_id: ownerId,
        creator_username: ownerUsername,
        thread_view_count: views,
        thread_create_date: createdAt,
        thread_update_date: updatedAt,
        thread_post_count: posts,
        node_title: nodeTitle,
        first_post: {
          // post_id: postId,
          // post_like_count: likes,
          // poster_user_id: postOwnerId,
          // poster_username: postOwnerUsername,
          // post_body_plain_text: plainText,
          post_like_count: likes,
          post_body_plain_text: plainText,
          post_body: bbText,
        },
      } = await lzt.getThread(threadId);
      const result = await this.set(threadId, {
        title,
        owner: {
          id: ownerId,
          username: ownerUsername,
          link: getMemberPerma(ownerId),
        },
        createdAt,
        updatedAt,
        posts,
        views,
        likes,
        link: getThreadPerma(threadId),
        plainText,
        bbText,
        node: {
          id: nodeId,
          title: nodeTitle,
          link: getForumsPerma(nodeId),
        },
      });
      return result?.value;
    } catch {
      console.error("Failed to fetch thread data from API, returning saved data if available");
    }

    if (!saved) {
      return undefined;
    }

    // extend lifetime of expired saved data if API request failed
    const result = await this.set(threadId, saved.value);
    return result?.value;
  }

  static async set(threadId: number, thread: CreateThreadData) {
    return await ThreadRepo.set(threadId, thread);
  }
}
