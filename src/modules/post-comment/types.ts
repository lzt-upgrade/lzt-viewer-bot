import { OwnerData } from "../../types/modules/owner";

export type PostCommentPostData = {
  id: number;
  link: string;
};

export type LikesData = {
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
  likes: LikesData;
  createdAt: number;
  updatedAt: number;
  link: string;
};

export type CreatePostCommentData = Omit<PostCommentData, "id">;
