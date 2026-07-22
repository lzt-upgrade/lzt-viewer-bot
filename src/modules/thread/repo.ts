import { BaseRepo } from "../../core/db";
import { CreateThreadData, ThreadData } from "./types";

export abstract class ThreadRepo extends BaseRepo {
  static override prefix = "thread";

  static async get(id: number) {
    return await super.getEntry<ThreadData>(id);
  }

  static async set(id: number, value: CreateThreadData) {
    return await super.setEntry<CreateThreadData, ThreadData>(id, value);
  }
}
