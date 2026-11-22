import { CallbackDataBuilder } from "@mtcute/dispatcher";

export const UserCustomBadgeActionButton = new CallbackDataBuilder(
  "user_custom_badge_action",
  "id",
  "action",
);

export const UserCustomBadgePanelButton = new CallbackDataBuilder("user_custom_badge_action");
export const UserCustomBadgeListButton = new CallbackDataBuilder("user_custom_badge_list");
