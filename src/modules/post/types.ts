import { OwnerData } from "../../types/modules/owner";

export type PostThreadData = {
  id: number;
  link: string;
};

export type LikesData = {
  count: number;
  link: string;
};

export type PostData = {
  id: number;
  thread: PostThreadData;
  owner: OwnerData;
  plainText: string;
  bbText: string;
  likes: LikesData;
  createdAt: number;
  updatedAt: number;
  link: string;
};

export type CreatePostData = Omit<PostData, "id">;
