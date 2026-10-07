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
        node_id: nodeId,
        title,
        user_id: ownerId,
        username: ownerUsername,
        view_count: views,
        post_date: createdAt,
        last_post_date: updatedAt,
        post_count: posts,
        node_title: nodeTitle,
        first_post: { likes, message_plain_text: plainText, message: bbText },
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
