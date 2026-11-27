import { RemarkRepo } from "./repo";
import { UserRepo } from "../user/repo";

export abstract class RemarkService {
  static async get(remarkId: number) {
    return await RemarkRepo.getById(remarkId);
  }

  static async getAll(offset: number = 0) {
    return await RemarkRepo.getAll(offset);
  }

  static async create(text: string) {
    return await RemarkRepo.create({ name: text });
  }

  static async delete(remarkId: number) {
    return await RemarkRepo.delete(remarkId);
  }

  static async getUsersByRemarkId(remarkId: number, offset = 0, pageSize = 10) {
    const remark = await this.get(remarkId);
    if (!remark) {
      return { users: [], hasNext: false };
    }

    const userIds = remark ? await RemarkRepo.getUniqueUsersByRemark(remarkId) : [];
    const end = offset + pageSize;

    const users = await Promise.all(
      userIds.slice(offset, end).map(async (userId) => {
        const cached = await UserRepo.get(userId);
        return { userId, username: cached?.value.username };
      }),
    );

    return { users, hasNext: end < userIds.length };
  }

  static async getAllByUserId(userId: number) {
    return await RemarkRepo.getAllByUserId(userId);
  }

  static async setToUser(userId: number, remarkId: number) {
    return await RemarkRepo.setToUser(userId, remarkId);
  }

  static async removeFromUser(userId: number, remarkId: number) {
    return await RemarkRepo.removeFromUser(userId, remarkId);
  }
}
