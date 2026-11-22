import { BotKeyboard, InlineKeyboardMarkup, InputInlineKeyboardButton, tl } from "@mtcute/bun";
import type { MessageContext } from "@mtcute/dispatcher";

import { env } from "./env.ts";

export const selectedGroupFilter = (msg: MessageContext) => env.GROUP_IDS.includes(msg.chat.id);
export const dmFilter = (msg: MessageContext) => msg.chat.id === msg.sender.id;
export const adminFilter = (msg: MessageContext) => env.ADMIN_IDS.includes(msg.sender.id);

export type TLEntityName = tl.TlObject["_"];

export const ENTITY_WITH_URL: TLEntityName[] = [
  "messageEntityTextUrl",
  "messageEntityUrl",
] as const;

const isCallbackButton = (button: InputInlineKeyboardButton) => {
  if (typeof button.type === "string") {
    return button.type === "callback";
  }

  return button.type._ === "inlineButtonTypeCallback";
};

export const filterCallbackKbBtn = (markup: InlineKeyboardMarkup | undefined) => {
  if (!markup) {
    return undefined;
  }

  const buttons = markup.buttons.map((row) => row.filter((button) => !isCallbackButton(button)));

  return BotKeyboard.inline(buttons);
};
