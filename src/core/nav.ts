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
export const ROW_SIZE = 2;

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
  for (let i = 0; i < contentButtons.length; i += ROW_SIZE) {
    const pageButtons = contentButtons.slice(i, i + ROW_SIZE);
    keyboard.push(pageButtons);
  }

  const nextOffset = offset + pageSize;
  const navButtons = [];
  if (offset) {
    navButtons.push(
      BotKeyboard.callback(
        i18n.nav.prev,
        callbackBuilder.build({
          offset: String(offset - pageSize),
          ...callbackData,
        }),
      ),
    );
  }
  if (hasNext) {
    navButtons.push(
      BotKeyboard.callback(
        i18n.nav.next,
        callbackBuilder.build({
          offset: String(nextOffset),
          ...callbackData,
        }),
      ),
    );
  }

  if (offset || hasNext) {
    keyboard.push(navButtons);
  }

  if (backButtonCb) {
    keyboard.push([BotKeyboard.callback(i18n.shared.back, backButtonCb)]);
  }

  return BotKeyboard.inline(keyboard);
};
