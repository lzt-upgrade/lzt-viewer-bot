import { OwnerData } from "../../types/modules/owner";

export type PostThreadData = {
  id: number;
  link: string;
};

export type ReactionsData = {
  count: number;
  link: string;
};

export type PostData = {
  id: number;
  thread: PostThreadData;
  owner: OwnerData;
  plainText: string;
  bbText: string;
  reactions: ReactionsData;
  createdAt: number;
  updatedAt: number;
  link: string;
};

export type CreatePostData = Omit<PostData, "id">;
