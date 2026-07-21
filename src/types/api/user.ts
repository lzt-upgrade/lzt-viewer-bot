import { DetailedTimestamp, ResponseWithSystemInfo } from "./system";
import { Thread, ThreadPerms } from "./thread";

export type UserLinks = {
  permalink: string;
  detail: string;
  avatar: string;
  avatar_big: string;
  avatar_small: string;
  followers: string;
  followings: string;
  ignore: string;
  background_l: string;
  background_m: string;
  timeline: string;
};
export type UserPerms = {
  edit: boolean;
  follow: boolean;
  create_conversation: boolean;
  ignore: boolean;
  profile_post: boolean;
};

export type UserGroup = {
  user_group_id: number;
  user_group_title: string;
  user_group_title_en: string;
  user_group_banner_css_class: string;
  user_group_banner_text: string;
  user_group_banner_text_en: string;
  display_group_selectable: boolean;
  display_banner_selectable: boolean;
  display_icon_selectable: boolean;
  is_primary_group: boolean;
  user_group_icon_class: string;
};

export type UserFieldChoice = {
  key: string;
  value: string;
};

export type UserField = {
  id: string;
  title: string;
  description: string;
  position: string;
  is_required: boolean;
  is_system: boolean;
  value?: string;
  editable?: boolean;
  is_multi_choice?: boolean;
  choices?: UserFieldChoice[];
  values?: unknown[];
};

export type UserExternalAuths = {
  provider: string;
  provider_key: string;
};

export type UserFollower = {
  user_id: number;
  username: string;
  username_html: string;
  avatar: string;
};

export type UserFollows = {
  users: UserFollower[];
  count: number;
};

export type UserProfileThread = Omit<
  Thread,
  "contest" | "first_post" | "last_post" | "permissions"
> & {
  permissions: Omit<ThreadPerms, "edit">;
};

export type UserEditPerms = {
  password: boolean;
  user_email: boolean;
  username: boolean;
  user_title: boolean;
  short_link: boolean;
  hide_username_logs: boolean;
  primary_group_id: boolean;
  secondary_group_ids: boolean;
  user_dob_day: boolean;
  user_dob_month: boolean;
  user_dob_year: boolean;
  fields: boolean;
};

export type UserBirthday = {
  age: number;
  timeStamp: DetailedTimestamp;
  format: string;
};

export type UserBan = {
  ban_date: number;
  end_date: number;
  reason: string;
  author: string;
};

export type User = {
  user_id: number;
  username: string;
  username_html: string;
  user_message_count: number;
  user_register_date: number;
  user_like_count: number;
  user_like2_count: number;
  contest_count: number;
  trophy_count: number;
  short_link: string;
  custom_title: string;
  is_banned: number; // maybe bool?
  ban?: UserBan;
  ban_reason?: string;
  display_banner_id: number;
  display_icon_group_id: number;
  conv_welcome_message: string;
  user_title: string;
  user_deposit: number;
  user_is_valid: boolean;
  user_is_verified: boolean;
  user_is_followed: boolean;
  user_last_seen_date: number;
  links: UserLinks;
  permissions: UserPerms;
  user_is_ignored: boolean;
  user_is_visitor: boolean;
  user_group_id: number;
  curator_titles?: string[];
  fields: UserField[];
  birthday: UserBirthday | null;
  user_following: UserFollows;
  user_followers: UserFollows;
  profile_threads: UserProfileThread[];
  banner: string;
};

export type CurrentUser = User & {
  show_dob_date: number;
  show_dob_year: number;
  balance: string;
  hold: string;
  currency: string;
  user_email: string;
  user_groups: UserGroup[];
  user_timezone_offset: number;
  user_external_authentications: UserExternalAuths[];
  self_permissions: {
    create_conversation: boolean;
  };
  edit_permissions: UserEditPerms;
  secret_answer_rendered: string;
  secret_answer_first_letter: string;
  user_unread_notification_count: number;
  user_unread_conversation_count: number;
};

export type UserResponse = ResponseWithSystemInfo & {
  user: User | CurrentUser;
};
