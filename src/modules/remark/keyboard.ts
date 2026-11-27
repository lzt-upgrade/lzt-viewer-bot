import { CallbackDataBuilder } from "@mtcute/dispatcher";

export const RemarkActionButton = new CallbackDataBuilder("rem_act", "id", "action");
export const RemarkStaticButton = new CallbackDataBuilder("rem_static", "action");
export const RemarkListButton = new CallbackDataBuilder("rem_list", "offset");
export const RemarkUserInfoButton = new CallbackDataBuilder("rem_usinfo", "offset", "id");
export const RemarkUsersByBadgeButton = new CallbackDataBuilder("rem_ulb", "remarkId", "offset");
