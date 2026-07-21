import { getTimestamp, hasSystemInfo, isAPIError, returnError } from "./utils";
import { ForumOptions, LZTResult } from "../types/api/client";
import { LZTErrorResponse } from "../types/api/error";
import { Thread, ThreadResponse } from "../types/api/thread";
import { RatelimitInfo } from "../types/api/system";
import { Locale } from "../types/locale";
import type { CurrentUser, User, UserResponse } from "../types/api/user";
import { env } from "../env";
import { Post, PostResponse } from "../types/api/post";
import { PostComment, PostCommentResponse } from "../types/api/post-comment";
import { ProfilePost, ProfilePostResponse } from "../types/api/profile-post";
import {
  ProfilePostCommentClientResponse,
  ProfilePostCommentResponse,
} from "../types/api/profile-post-comment";

export class ForumClient {
  private domain: string;
  private apiToken: string;
  private locale: Locale;
  private ratelimitInfo: RatelimitInfo | undefined;

  constructor(opts?: ForumOptions) {
    const {
      domain = "prod-api.lolz.live",
      apiToken,
      locale = env.LOCALE,
    } = opts ?? {};
    if (!apiToken) {
      throw new Error("API token is required");
    }

    this.domain = domain;
    this.apiToken = apiToken;
    this.locale = locale;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  get hasRatelimit() {
    if (!this.ratelimitInfo) {
      return false;
    }

    return (
      // 1 request for safety
      this.ratelimitInfo.remaining <= 1 &&
      this.ratelimitInfo.reset > getTimestamp()
    );
  }

  async request<T>(
    path: string,
    opts: RequestInit = {},
  ): Promise<LZTResult<T>> {
    try {
      if (this.hasRatelimit) {
        throw new Error(
          "Looks like Ratelimit exceeded. Please wait before making more requests",
        );
      }

      const { headers: extraHeaders, ...restOpts } = opts;
      const res = await fetch(
        `https://${this.domain}/${path}?locale=${this.locale}`,
        {
          headers: {
            ...this.headers,
            ...extraHeaders,
          },
          ...restOpts,
        },
      );

      const data = (await res.json()) as LZTErrorResponse | T;
      if (isAPIError(data)) {
        throw new Error(data.errors?.join(", ") ?? `Failed to request ${path}`);
      }

      if (hasSystemInfo(data)) {
        this.ratelimitInfo = data.system_info.rate_limit;
      }

      return {
        success: true,
        data,
      };
    } catch (err) {
      console.error(`Failed to request ${path}:`, err);
      return {
        success: false,
        error: returnError(err),
      };
    }
  }

  async getThread(threadId: number): Promise<Thread> {
    const result = await this.request<ThreadResponse>(`threads/${threadId}`);
    if (!result.success) {
      throw result.error;
    }

    return result.data.thread;
  }

  async getUser<T = number | string>(
    userIdOrSlug: T,
  ): Promise<T extends "me" ? CurrentUser : User> {
    const result = await this.request<UserResponse>(`users/${userIdOrSlug}`);
    if (!result.success) {
      throw result.error;
    }

    return result.data.user as T extends "me" ? CurrentUser : User;
  }

  async getPost(postId: number): Promise<Post> {
    const result = await this.request<PostResponse>(`posts/${postId}`);
    if (!result.success) {
      throw result.error;
    }

    return result.data.post;
  }

  async getPostComment(postCommentId: number): Promise<PostComment> {
    const result = await this.request<PostCommentResponse>(
      `posts/comments?post_comment_id=${postCommentId}`,
    );
    if (!result.success) {
      throw result.error;
    }

    return result.data.comments[0];
  }

  async getProfilePost(profilePostId: number): Promise<ProfilePost> {
    const result = await this.request<ProfilePostResponse>(
      `profile-posts/${profilePostId}`,
    );
    if (!result.success) {
      throw result.error;
    }

    return result.data.profile_post;
  }

  async getProfilePostComment(
    commentId: number,
  ): Promise<ProfilePostCommentClientResponse> {
    const result = await this.request<ProfilePostCommentResponse>(
      `profile-posts/comments/?comment_id=${commentId}`,
    );
    if (!result.success) {
      throw result.error;
    }

    const { comments, profile_post, timeline_user } = result.data;

    return {
      comment: comments[0],
      profile_post,
      timeline_user,
    };
  }
}
