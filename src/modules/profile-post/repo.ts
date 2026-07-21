import { BaseRepo } from "../../core/db";
import { CreateProfilePostData, ProfilePostData } from "./types";

export abstract class ProfilePostRepo extends BaseRepo {
  static override prefix = "profile-post";

  static async get(id: number) {
    return await super.getEntry<ProfilePostData>(id);
  }

  static async set(id: number, value: CreateProfilePostData) {
    return await super.setEntry<CreateProfilePostData, ProfilePostData>(
      id,
      value,
    );
  }
}
