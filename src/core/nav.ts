import { BotKeyboard, CallbackButton } from "@mtcute/bun";
import i18n from "../i18n";
import { CallbackDataBuilder } from "@mtcute/dispatcher";

export type NavOptions = {
  offset?: number;
  pageSize?: number;
  callbackBuilder: CallbackDataBuilder<string>;
  callbackData: Record<string, string>;
  backButtonCb?: string;
  hasNext?: boolean;
};

export const PAGE_SIZE = 10;

export const buildNav = (
  contentButtons: CallbackButton[],
  {
    offset = 0,
    pageSize = PAGE_SIZE,
    hasNext,
    callbackBuilder,
    callbackData,
    backButtonCb,
  }: NavOptions,
) => {
  const keyboard = [];
  if (offset) {
    keyboard.push([
      BotKeyboard.callback(
        i18n.nav.prev,
        callbackBuilder.build({
          offset: String(offset - pageSize),
          ...callbackData,
        }),
      ),
    ]);
  }

  keyboard.push(contentButtons);
  const nextOffset = offset + pageSize;
  if (hasNext) {
    keyboard.push([
      BotKeyboard.callback(
        i18n.nav.next,
        callbackBuilder.build({
          offset: String(nextOffset),
          ...callbackData,
        }),
      ),
    ]);
  }

  if (backButtonCb) {
    keyboard.push([BotKeyboard.callback(i18n.shared.back, backButtonCb)]);
  }

  return BotKeyboard.inline(keyboard);
};
