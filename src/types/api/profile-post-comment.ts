import { ProfilePost } from "./profile-post";
import { ResponseWithSystemInfo } from "./system";
import { User } from "./user";

export type ProfilePostCommentPerms = {
  view: boolean;
  edit: boolean;
  delete: boolean;
  undelete: boolean;
  report: boolean;
};

export type ProfilePostCommentLinks = {
  detail: string;
  profile_post: string;
  timeline: string;
  timeline_user: string;
  poster: string;
  poster_avatar: string;
};

export type ProfilePostComment = {
  comment_id: number;
  profile_post_id: number;
  comment_user_id: number;
  comment_username: string;
  comment_username_html: string;
  comment_is_banned: number;
  comment_create_date: number;
  comment_body: string;
  comment_body_html: string;
  comment_body_plain_text: string;
  comment_is_published: boolean;
  comment_is_deleted: boolean;
  user_is_ignored: boolean;
  timeline_user_id: number;
  links: ProfilePostCommentLinks;
  permissions: ProfilePostCommentPerms;
};

export type ProfilePostCommentResponse = ResponseWithSystemInfo & {
  comments: ProfilePostComment[];
  comments_total: number;
  profile_post: Omit<ProfilePost, "timeline_user">;
  timeline_user: User;
};

export type ProfilePostCommentClientResponse = {
  comment: ProfilePostComment;
  profile_post: ProfilePostCommentResponse["profile_post"];
  timeline_user: ProfilePostCommentResponse["timeline_user"];
};
