import { ResponseWithSystemInfo } from "./system";
import { User } from "./user";

export type ProfilePostPerms = {
  view: boolean;
  edit: boolean;
  delete: boolean;
  like: boolean;
  comment: boolean;
  report: boolean;
  stick: boolean;
};

export type ProfilePostLinks = {
  permalink: string;
  detail: string;
  timeline: string;
  timeline_user: string;
  poster: string;
  likes: string;
  comments: string;
  report: string;
  poster_avatar: string;
};

export type ProfilePost = {
  profile_post_id: number;
  timeline_user_id: number;
  poster_user_id: number;
  poster_username: string;
  poster_username_html: string;
  post_create_date: number;
  post_body: string;
  post_body_html: string;
  post_body_plain_text: string;
  post_like_count: number;
  post_comment_count: number;
  post_comments_is_disabled: number;
  timeline_username: string;
  user_is_ignored: boolean;
  post_is_published: boolean;
  post_is_deleted: boolean;
  post_is_liked: boolean;
  post_is_sticked: boolean;
  links: ProfilePostLinks;
  permissions: ProfilePostPerms;
  timeline_user: User;
};

export type ProfilePostResponse = ResponseWithSystemInfo & {
  profile_post: ProfilePost;
};
