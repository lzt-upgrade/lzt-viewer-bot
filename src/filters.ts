import { BotKeyboard, InlineKeyboardMarkup, tl } from "@mtcute/bun";
import type { MessageContext } from "@mtcute/dispatcher";

import { env } from "./env.ts";

export const selectedGroupFilter = (msg: MessageContext) => env.GROUP_IDS.includes(msg.chat.id);

export type TLEntityName = tl.TlObject["_"];

export const ENTITY_WITH_URL: TLEntityName[] = [
  "messageEntityTextUrl",
  "messageEntityUrl",
] as const;

export const filterCallbackKbBtn = (markup: InlineKeyboardMarkup | undefined) => {
  if (!markup) {
    return undefined;
  }

  const buttons = markup.buttons.map((row) =>
    row.filter((button) => button._ !== "keyboardButtonCallback"),
  );

  return BotKeyboard.inline(buttons);
};
