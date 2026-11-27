import { adminDb } from "../../core/db";
import { PAGE_SIZE } from "../../core/nav";
import { CreateRemark } from "./sctema";

export abstract class RemarkRepo {
  static async getAll(offset: number = 0) {
    return await adminDb
      .selectFrom("remark")
      .limit(PAGE_SIZE + 1)
      .offset(offset)
      .selectAll()
      .execute();
  }

  static async create(remark: CreateRemark) {
    return await adminDb.insertInto("remark").values(remark).returningAll().executeTakeFirst();
  }

  static async getByName(name: string) {
    return await adminDb
      .selectFrom("remark")
      .where("name", "=", name)
      .selectAll()
      .executeTakeFirst();
  }

  static async getById(remarkId: number) {
    return await adminDb
      .selectFrom("remark")
      .where("id", "=", remarkId)
      .selectAll()
      .executeTakeFirst();
  }

  static async delete(remarkId: number) {
    return await adminDb.deleteFrom("remark").where("id", "=", remarkId).execute();
  }

  static async getUniqueUsersByRemark(remarkId: number) {
    return (
      await adminDb
        .selectFrom("user_remarks")
        .where("remarkId", "=", remarkId)
        .select("userId")
        .execute()
    ).map((row) => row.userId);
  }

  static async setToUser(userId: number, remarkId: number) {
    return await adminDb
      .insertInto("user_remarks")
      .values({ userId, remarkId })
      .returningAll()
      .executeTakeFirst();
  }

  static async removeFromUser(userId: number, remarkId: number) {
    return await adminDb
      .deleteFrom("user_remarks")
      .where("userId", "=", userId)
      .where("remarkId", "=", remarkId)
      .execute();
  }

  static async getAllByUserId(userId: number) {
    return await adminDb
      .selectFrom("user_remarks")
      .innerJoin("remark", "user_remarks.remarkId", "remark.id")
      .where("userId", "=", userId)
      .select(["user_remarks.userId", "remark.id as remarkId", "remark.name as remarkName"])
      .execute();
  }
}
