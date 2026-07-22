import { ResponseWithSystemInfo } from "./system";
import type { Post } from "./post";

/**
 * @default "*""
 */
export type FieldInclude = "*" | "latest_posts";

export type ThreadPrefix = {
  prefix_id: number;
  prefix_title: string;
};

export type ThreadLink = {
  permalink: string;
  detail: string;
  followers: string;
  forum: string;
  posts: string;
  first_poster: string;
  first_poster_avatar: string;
  first_post: string;
  last_poster: string;
  last_post: string;
};

export type ThreadPermsBump = {
  can: boolean;
  available_count: number;
  error: string;
  next_available_time: number;
};

export type ThreadPerms = {
  view: boolean;
  delete: boolean;
  follow: boolean;
  post: boolean;
  edit: boolean;
  bump: ThreadPermsBump;
};

export type ThreadContestPerms = {
  can_finish: boolean;
  can_participate: boolean;
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
  prize_data: {
    additionalProp: number;
  };
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
  forum_id: number;
  thread_title: string;
  thread_view_count: number;
  creator_user_id: number;
  creator_username: string;
  creator_username_html: string;
  thread_create_date: number;
  thread_update_date: number;
  thread_reply_group_id: number;
  thread_comment_ignore_group: number;
  thread_last_bump_date: number;
  user_is_ignored: boolean;
  thread_post_count: number;
  thread_is_liked: boolean;
  thread_is_bumped: boolean;
  thread_is_published: boolean;
  thread_is_deleted: boolean;
  thread_is_sticky: boolean;
  thread_is_closed: boolean;
  thread_is_followed: boolean;
  thread_is_starred: boolean;
  thread_hide_contacts?: boolean;
  thread_allow_ask_hidden_content?: boolean;
  first_post: Post;
  thread_prefixes: ThreadPrefix[];
  thread_tags: Record<string, string>; // MAYBE ITS ARRAY OF OBJECTS
  links: ThreadLink;
  permissions: ThreadPerms;
  node_title: string;
  last_post?: Post;
  contest?: ThreadContest;
};

export type ThreadResponse = ResponseWithSystemInfo & {
  thread: Thread;
};
