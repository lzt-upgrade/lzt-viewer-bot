import type { Generated, Insertable } from "kysely";

export type RemarkTable = {
  id: Generated<number>;
  name: string;
  createdAt: Generated<string>;
};

export type UserRemarkTable = {
  remarkId: number;
  userId: number;
};

export type CreateRemark = Insertable<RemarkTable>;
