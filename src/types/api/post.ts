import { DeleteInfo, ResponseWithSystemInfo } from "./system";
import { Thread } from "./thread";

export type PostLinks = {
  permalink: string;
  detail: string;
  thread: string;
  poster: string;
  likes: string;
  report: string;
  poster_avatar: string;
};

export type PostPerms = {
  view: boolean;
  edit: boolean;
  delete: boolean;
  undelete: boolean;
  reply: boolean;
  like: boolean;
  report: boolean;
  stick: boolean;
  unstick: boolean;
};

export type PostThread = Omit<Thread, "first_post" | "last_post">;

export type Post = {
  post_id: number;
  thread_id: number;
  poster_user_id: number;
  poster_username: string;
  poster_username_html: string;
  poster_is_banned: number; // maybe is bool???
  poster_is_staff: number; // maybe is bool???
  post_create_date: number;
  post_body: string;
  post_body_html: string;
  post_body_plain_text: string;
  signature: string;
  signature_html: string;
  signature_plain_text: string;
  post_like_count: number;
  delete_info?: DeleteInfo;
  user_is_ignored: boolean;
  post_is_sticked: boolean;
  post_is_published: boolean;
  post_is_deleted: boolean;
  post_update_date: number;
  post_is_first_post: boolean;
  post_is_liked: boolean;
  links: PostLinks;
  permissions: PostPerms;
  thread_is_deleted: boolean;
  thread_is_closed: boolean;
  thread: PostThread;
};

export type PostResponse = ResponseWithSystemInfo & {
  post: Post;
};
