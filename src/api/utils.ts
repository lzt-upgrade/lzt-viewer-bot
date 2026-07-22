import { env } from "../env";

import type { LZTErrorResponse } from "../types/api/error";
import { ResponseWithSystemInfo } from "../types/api/system";

export const returnError = (error: unknown) =>
  Error.isError(error) ? error : new Error((error as string).toString());

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isAPIError = <T>(data: T | LZTErrorResponse): data is LZTErrorResponse =>
  isObject(data) && Object.hasOwn(data, "errors");

export const hasSystemInfo = <T>(data: T | LZTErrorResponse): data is ResponseWithSystemInfo & T =>
  isObject(data) && Object.hasOwn(data, "system_info");

export const getTimestamp = () => Math.floor(Date.now() / 1000);

export const getThreadPerma = (threadId: number) => `${env.FORUM_BASE}/threads/${threadId}`;

export const getPostPerma = (postId: number) => `${env.FORUM_BASE}/posts/${postId}`;

export const getPostLikesPerma = (postId: number) => `${getPostPerma(postId)}/likes`;

export const getPostCommentPerma = (postId: number) => `${env.FORUM_BASE}/posts/comments/${postId}`;

export const getPostCommentLikesPerma = (postId: number) => `${getPostCommentPerma(postId)}/likes`;

export const getMemberPerma = (memberId: number) => `${env.FORUM_BASE}/members/${memberId}`;

export const getForumsPerma = (forumId: number) => `${env.FORUM_BASE}/forums/${forumId}`;

export const getMemberSympathiesPerma = (memberId: number) => `${getMemberPerma(memberId)}/likes`;

export const getMemberMessagesPerma = (username: string) =>
  `${env.FORUM_BASE}/search/search?users=${username}&content=post`;

export const getMemberLikesPerma = (memberId: number) => `${getMemberPerma(memberId)}/likes2`;

export const getMemberTrophiesPerma = (memberId: number) => `${getMemberPerma(memberId)}/#trophies`;

export const getMemberFollowingPerma = (memberId: number) =>
  `${getMemberPerma(memberId)}/following`;

export const getMemberFollowersPerma = (memberId: number) =>
  `${getMemberPerma(memberId)}/followers`;

export const getProfilePostPerma = (profilePostId: number) =>
  `${env.FORUM_BASE}/profile-posts/${profilePostId}`;

export const getProfilePostLikesPerma = (profilePostId: number) =>
  `${getProfilePostPerma(profilePostId)}/likes`;

export const getProfilePostCommentsPerma = (profilePostId: number) =>
  `${getProfilePostPerma(profilePostId)}/comments`;
