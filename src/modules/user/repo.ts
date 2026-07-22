import { BaseRepo } from "../../core/db";
import { CreateUserData, UserData } from "./types";

export abstract class UserRepo extends BaseRepo {
  static override prefix = "user";

  static async get(id: number | string) {
    return await super.getEntry<UserData>(id);
  }

  static async set(id: number | string, value: CreateUserData) {
    return await super.setEntry<CreateUserData, UserData>(id, value);
  }
}
