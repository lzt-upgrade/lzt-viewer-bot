import { BaseRepo } from "../../core/db";
import { CreatePostData, PostData } from "./types";

export abstract class PostRepo extends BaseRepo {
  static override prefix = "post";

  static async get(id: number) {
    return await super.getEntry<PostData>(id);
  }

  static async set(id: number, value: CreatePostData) {
    return await super.setEntry<CreatePostData, PostData>(id, value);
  }
}
