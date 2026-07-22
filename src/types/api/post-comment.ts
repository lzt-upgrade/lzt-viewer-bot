import type { ResponseWithSystemInfo } from "./system";

export type PostCommentLinks = {
  permalink: string;
  detail: string;
  post: string;
  thread: string;
  poster: string;
  likes: string;
  report: string;
  poster_avatar: string;
};

export type PostCommentPerms = {
  view: boolean;
  edit: boolean;
  delete: boolean;
  reply: boolean;
  like: boolean;
  report: boolean;
};

export type PostComment = {
  post_comment_id: number;
  post_id: number;
  thread_id: number;
  poster_user_id: number;
  poster_username: string;
  poster_username_html: string;
  post_comment_create_date: number;
  post_comment_body: string;
  post_comment_body_html: string;
  post_comment_body_plain_text: string;
  post_comment_like_count: number;
  user_is_ignored: boolean;
  post_comment_is_published: boolean;
  post_comment_is_deleted: boolean;
  post_comment_update_date: number;
  links: PostCommentLinks;
  permissions: PostCommentPerms;
};

export type PostCommentResponse = ResponseWithSystemInfo & {
  comments: PostComment[];
};
