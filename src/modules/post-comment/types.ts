import { OwnerData } from "../../types/modules/owner";

export type PostCommentPostData = {
  id: number;
  link: string;
};

export type ReactsData = {
  count: number;
  link: string;
};

export type PostCommentData = {
  id: number;
  post: PostCommentPostData;
  threadId: number;
  owner: OwnerData;
  plainText: string;
  bbText: string;
  reactions: ReactsData;
  createdAt: number;
  updatedAt: number;
  link: string;
};

export type CreatePostCommentData = Omit<PostCommentData, "id">;
