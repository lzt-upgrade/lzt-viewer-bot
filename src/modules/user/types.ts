import { GROUPS_WITH_BANNER, SIMPLE_GROUPS } from "./group";
import { predictRemarks } from "./trophy";

export type Group = (typeof GROUPS_WITH_BANNER)[number] | (typeof SIMPLE_GROUPS)[number];

export type UserLinksData = {
  messages: string;
  sympathies: string;
  likes: string;
  trophies: string;
  followers: string;
  followings: string;
  market: string;
  reports: string;
  telegram: string | undefined;
  avatarUrl: string | undefined;
};

export type UserBanInfo = {
  banned: boolean;
  reason: string | undefined;
  endDate: number | undefined;
  startDate: number | undefined;
  author: string | undefined;
};

export type UserData = {
  id: number;
  username: string;
  messages: number;
  deposit: number;
  sympathies: number;
  likes: number;
  views: number | undefined;
  sells: number | undefined;
  reviews: number | undefined;
  reports: number | undefined;
  remarks: ReturnType<typeof predictRemarks>;
  contests: number;
  trophies: number;
  followers: number;
  followings: number;
  slug: string;
  status: string;
  group: string;
  predictedGroup: string | undefined;
  banInfo: UserBanInfo;
  link: string;
  links: UserLinksData;
  lastSeenAt: number;
  createdAt: number;
};

export type CreateUserData = Omit<UserData, "id">;
