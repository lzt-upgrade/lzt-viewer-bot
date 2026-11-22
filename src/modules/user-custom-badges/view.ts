import { html } from "@mtcute/html-parser";
import { BotKeyboard } from "@mtcute/bun";

import { LinkView } from "../../types/view";
import i18n from "../../i18n";
import { UserCustomBadgeListButton, UserCustomBadgePanelButton } from "./keyboard";

export abstract class UserCustomBadgeAdmin {
  static async getPanel(): Promise<LinkView> {
    return {
      message: html`<b>${i18n.userCustomBadgeAdmin.main}</b>`,
      keyboard: BotKeyboard.inline([
        [
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.create,
            UserCustomBadgeListButton.build({}),
          ),
          BotKeyboard.callback(i18n.userCustomBadgeAdmin.list, UserCustomBadgeListButton.build({})),
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.delete,
            UserCustomBadgeListButton.build({}),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.addToUser,
            UserCustomBadgeListButton.build({}),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.userList,
            UserCustomBadgeListButton.build({}),
          ),
        ],
      ]),
    };
  }

  static async getUserList(): Promise<LinkView> {
    return {
      message: html`<b>${i18n.userCustomBadgeAdmin.userList}</b>`,
      keyboard: BotKeyboard.inline([
        [BotKeyboard.callback(i18n.shared.back, UserCustomBadgePanelButton.build({}))],
      ]),
    };
  }
}
