import { OwnerData } from "../../types/modules/owner";

export type LikesCommentsData = {
  count: number;
  link: string;
};

export type ProfileData = {
  id: number;
  username: string;
  link: string;
};

export type ProfilePostData = {
  id: number;
  owner: OwnerData;
  likes: LikesCommentsData;
  comments: LikesCommentsData;
  profile: ProfileData;
  plainText: string;
  bbText: string;
  createdAt: number;
  link: string;
};

export type CreateProfilePostData = Omit<ProfilePostData, "id">;
