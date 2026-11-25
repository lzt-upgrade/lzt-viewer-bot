import type { ResponseWithSystemInfo } from "./system";
import type { ReactionData } from "./reactions";

export type ReactionUser = {
  user_id: number;
  username: string;
  reaction_id: number;
  quantity: number;
};

export type Post = {
  post_id: number;
  thread_id: number;
  node_id: number;
  user_id: number;
  username: string;
  username_html: string;
  avatar_url: string;
  view_url: string;
  is_banned: boolean;
  is_staff: boolean;
  post_date: number;
  update_date: number;
  message: string;
  message_html: string;
  message_plain_text: string;
  message_state: string;
  signature: string;
  signature_html: string;
  signature_plain_text: string;
  comment_count: number;
  position: number;
  edit_count: number;
  last_edit_date: number;
  last_edit_user_id: number;
  sticky_user_id: number;
  warning_id: number;
  warning_message: string;
  is_ignored: boolean;
  is_sticked: boolean;
  is_first_post: boolean;
  is_last_post: boolean;
  is_unread: boolean;
  thread_is_deleted: boolean;
  thread_is_closed: boolean;
  can_edit: boolean;
  can_hard_delete: boolean;
  can_react: boolean;
  can_reply: boolean;
  can_report: boolean;
  can_soft_delete: boolean;
  can_stick: boolean;
  can_undelete: boolean;
  can_unstick: boolean;
  can_view: boolean;
} & ReactionData;

export type PostResponse = ResponseWithSystemInfo & {
  post: Post;
};
