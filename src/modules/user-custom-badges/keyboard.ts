import { CallbackDataBuilder } from "@mtcute/dispatcher";

export const UserCustomBadgeActionButton = new CallbackDataBuilder("ucb_action", "id", "action");

export const UserCustomBadgeStaticButton = new CallbackDataBuilder("ucb_static", "action");

export const UserCustomBadgeListButton = new CallbackDataBuilder("ucb_list", "offset");

export const UserCustomBadgeUserListButton = new CallbackDataBuilder("ucb_users", "offset");

export const UserCustomBadgeUserInfoButton = new CallbackDataBuilder(
  "ucb_user_info",
  "offset",
  "id",
);

export const UserCustomBadgeUsersByBadgeButton = new CallbackDataBuilder(
  "ucb_ulb",
  "badgeId",
  "offset",
);
