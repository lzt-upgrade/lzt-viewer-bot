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
        poster_user_id: ownerId,
        poster_username: username,
        post_id: postId,
        post_comment_create_date: createdAt,
        post_comment_update_date: updatedAt,
        post_comment_like_count: likes,
        thread_id: threadId,
        post_comment_body: bbText,
        post_comment_body_plain_text: plainText,
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
