import { ReactionData } from "./reactions";
import { ResponseWithSystemInfo } from "./system";
import { User } from "./user";

export type ProfilePost = {
  can_comment: boolean;
  can_edit: boolean;
  can_hard_delete: boolean;
  can_react: boolean;
  can_report: boolean;
  can_soft_delete: boolean;
  can_stick: boolean;
  can_undelete: boolean;
  can_view: boolean;
  comment_count: number;
  disable_comments: boolean;
  first_comment_date: number;
  is_ignored: boolean;
  is_reacted_to: boolean;
  is_sticked: boolean;
  last_comment_date: number;
  message: string;
  message_html: string;
  message_plain_text: string;
  message_state: "visible";
  post_date: number;
  profile_post_id: number;
  profile_user: User;
  profile_user_id: number;
  sticky_user_id: number;
  user: User;
  user_id: number;
  username: string;
  view_url: string;
  warning_id: number;
  warning_message: string;
} & ReactionData;

export type ProfilePostResponse = ResponseWithSystemInfo & {
  profile_post: ProfilePost;
};
