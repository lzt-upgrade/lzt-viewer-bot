import { ResponseWithSystemInfo } from "./system";
import type { Post } from "./post";

/**
 * @default "*""
 */
export type FieldInclude = "*" | "latest_posts";

export type ThreadBump = {
  can: boolean;
  available_count: number;
  error: string;
  next_available_time: number;
};

export type ThreadContestPerms = {
  can_finish: boolean;
  can_participate: boolean;
  can_participate_error: string;
  can_view_user_list: boolean;
};

export type ThreadContest = {
  type: string;
  finish_date: number;
  now_count_members: number;
  needed_members: number;
  is_finished: number;
  count_winners: number;
  require_like_count: number;
  require_total_like_count: number;
  prize_type: string;
  prize_type_phrase: string;
  prize_data: Record<string, number> | number;
  prize_cost: number;
  is_money_places: number;
  chance_to_win: number;
  prize_per_winner: number;
  prize_places: {
    place: number;
    amount: number;
  };
  already_participate: boolean;
  permissions: ThreadContestPerms;
};

export type Thread = {
  thread_id: number;
  node_id: number;
  node_title: string;
  title: string;
  title_en: string;
  view_url: string;
  avatar_url: string;
  view_count: number;
  user_id: number;
  username: string;
  username_html: string;
  post_date: number;
  reply_group_id: number;
  comment_ignore_group: boolean;
  last_bump_date: number;
  is_ignored: boolean;
  post_count: number;
  reply_count: number;
  visitor_post_count: number;
  is_liked: boolean;
  is_bumped: boolean;
  is_hidden: boolean;
  is_hot: boolean;
  is_like2_node: boolean;
  is_unread: boolean;
  is_watched: boolean;
  is_starred: boolean;
  sticky: boolean;
  hide_contacts: boolean;
  allow_ask_hidden_content: boolean;
  discussion_open: boolean;
  discussion_state: string;
  discussion_type: string;
  first_post: Post;
  first_post_id: number;
  first_post_likes: number;
  last_post_id: number;
  last_post_date: number;
  last_post_user_id: number;
  last_post_username: string;
  prefix_id: number;
  prefix_ids: number[];
  tags: string[];
  review_negative_count: number;
  review_paid_count: number;
  review_positive_count: number;
  review_score: number;
  review_share: number;
  review_total_count: number;
  review_unproven_count: number;
  bump: ThreadBump;
  can_edit: boolean;
  can_edit_tags: boolean;
  can_edit_title: boolean;
  can_hard_delete: boolean;
  can_reply: boolean;
  can_soft_delete: boolean;
  can_view: boolean;
  can_watch: boolean;
  contest?: ThreadContest;
};

export type ThreadResponse = ResponseWithSystemInfo & {
  thread: Thread;
};
