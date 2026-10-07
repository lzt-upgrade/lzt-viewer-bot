import type { ResponseWithSystemInfo } from "./system";

export type PostComment = {
  post_comment_id: number;
  post_id: number;
  thread_id: number;
  user_id: number;
  username: string;
  username_html: string;
  avatar_url: string;
  view_url: string;
  is_banned: boolean;
  comment_date: number;
  update_date: number;
  message: string;
  message_html: string;
  message_plain_text: string;
  message_state: string;
  signature: string;
  signature_html: string;
  signature_plain_text: string;
  likes: number;
  like_date: number;
  edit_count: number;
  last_edit_date: number;
  last_edit_user_id: number;
  warning_id: number;
  warning_message: string;
  is_ignored: boolean;
  is_like2_node: boolean;
  is_liked: boolean;
  can_edit: boolean;
  can_hard_delete: boolean;
  can_like: boolean;
  can_reply: boolean;
  can_report: boolean;
  can_soft_delete: boolean;
  can_undelete: boolean;
  can_view: boolean;
};

export type PostCommentResponse = ResponseWithSystemInfo & {
  comments: PostComment[];
};
