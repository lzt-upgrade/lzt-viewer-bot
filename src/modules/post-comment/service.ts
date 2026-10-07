import { isExpired } from "../../core/db";
import { PostCommentRepo } from "./repo";
import { lzt } from "../../core/lzt";
import {
  getMemberPerma,
  getPostCommentLikesPerma,
  getPostCommentPerma,
  getPostPerma,
} from "../../api/utils";
import { CreatePostCommentData } from "./types";

export abstract class PostCommentService {
  static async get(postCommentId: number) {
    const saved = await PostCommentRepo.get(postCommentId);
    if (saved && !isExpired(saved)) {
      return saved.value;
    }

    try {
      const {
        user_id: ownerId,
        username,
        post_id: postId,
        comment_date: createdAt,
        update_date: updatedAt,
        likes,
        thread_id: threadId,
        message: bbText,
        message_plain_text: plainText,
      } = await lzt.getPostComment(postCommentId);

      const result = await this.set(postId, {
        threadId,
        post: {
          id: postId,
          link: getPostPerma(postId),
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
          link: getPostCommentLikesPerma(postId),
        },
        link: getPostCommentPerma(postId),
      });

      return result?.value;
    } catch {
      console.error(
        "Failed to fetch post comment data from API, returning saved data if available",
      );
    }

    if (!saved) {
      return undefined;
    }

    // extend lifetime of expired saved data if API request failed
    const result = await this.set(postCommentId, saved.value);
    return result?.value;
  }

  static async set(postCommentId: number, postComment: CreatePostCommentData) {
    return await PostCommentRepo.set(postCommentId, postComment);
  }
}
