import { BaseRepo } from "../../core/db";
import { CreatePostCommentData, PostCommentData } from "./types";

export abstract class PostCommentRepo extends BaseRepo {
  static override prefix = "post-comment";

  static async get(id: number) {
    return await super.getEntry<PostCommentData>(id);
  }

  static async set(id: number, value: CreatePostCommentData) {
    return await super.setEntry<CreatePostCommentData, PostCommentData>(
      id,
      value,
    );
  }
}
