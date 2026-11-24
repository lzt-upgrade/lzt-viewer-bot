import { html } from "@mtcute/html-parser";
import { BotKeyboard } from "@mtcute/bun";

import { LinkView } from "../../types/view";
import i18n from "../../i18n";
import {
  UserCustomBadgeActionButton,
  UserCustomBadgeListButton,
  UserCustomBadgeStaticButton,
  UserCustomBadgeUserInfoButton,
  UserCustomBadgeUserListButton,
  UserCustomBadgeUsersByBadgeButton,
} from "./keyboard";
import { UserCustomBadgeMapRepo, UserCustomBadgeRepo } from "./repo";
import { buildNav, PAGE_SIZE } from "../../core/nav";
import { UserService } from "../user/service";
import { UserCustomBadgeService } from "./service";

export abstract class UserCustomBadgeAdmin {
  static async getPanel(): Promise<LinkView> {
    return {
      message: html`<b>${i18n.userCustomBadgeAdmin.main}</b>`,
      keyboard: BotKeyboard.inline([
        [
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.create,
            UserCustomBadgeStaticButton.build({
              action: "create",
            }),
          ),
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.list,
            UserCustomBadgeListButton.build({
              offset: "0",
            }),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.userList,
            UserCustomBadgeUserListButton.build({
              offset: "0",
            }),
          ),
        ],
      ]),
    };
  }

  static async getUserList(offset: number = 0): Promise<LinkView> {
    const { users, hasNext } = await UserCustomBadgeMapRepo.getUniqueUsersWithInfo(
      offset,
      PAGE_SIZE,
    );

    return {
      message: html`<b>${i18n.userCustomBadgeAdmin.userList}</b>: ${String(users.length)}
        ${i18n.shared.pcs}`,
      keyboard: buildNav(
        users.map((user) => {
          return BotKeyboard.callback(
            user.username ?? `#${user.userId}`,
            UserCustomBadgeUserInfoButton.build({
              id: String(user.userId),
              offset: "0",
            }),
          );
        }),
        {
          offset,
          hasNext,
          callbackBuilder: UserCustomBadgeUserListButton,
          callbackData: {},
          backButtonCb: UserCustomBadgeStaticButton.build({
            action: "back",
          }),
        },
      ),
    };
  }

  static async getUserListByBadge(badgeId: string, offset: number = 0): Promise<LinkView> {
    const { users, hasNext } = await UserCustomBadgeService.getUsersByBadge(
      badgeId,
      offset,
      PAGE_SIZE,
    );

    return {
      message: html`<b>${i18n.userCustomBadgeAdmin.userList}</b>: ${String(users.length)}
        ${i18n.shared.pcs}`,
      keyboard: buildNav(
        users.map((user) => {
          return BotKeyboard.callback(
            user.username ?? `#${user.userId}`,
            UserCustomBadgeUserInfoButton.build({
              id: String(user.userId),
              offset: "0",
            }),
          );
        }),
        {
          offset,
          hasNext,
          callbackBuilder: UserCustomBadgeUsersByBadgeButton,
          callbackData: {
            badgeId,
          },
          backButtonCb: UserCustomBadgeActionButton.build({
            action: "view",
            id: badgeId,
          }),
        },
      ),
    };
  }

  static async getBadgeInfo(badgeId: string, backOffset: number = 0): Promise<LinkView> {
    const badge = await UserCustomBadgeRepo.get(badgeId);
    if (!badge) {
      return {
        message: html`${i18n.userCustomBadgeAdmin.badgeNotFound}`,
      };
    }

    return {
      message: html`<b>${i18n.userCustomBadgeAdmin.badgeInfo}</b> #${badge.badgeId}<br />
        ${badge.text}`,
      keyboard: BotKeyboard.inline([
        [
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.addToUser,
            UserCustomBadgeActionButton.build({
              id: badge.badgeId,
              action: "add_to_user",
            }),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.takeoffBadge,
            UserCustomBadgeActionButton.build({
              action: "takeoff_badge",
              id: badge.badgeId,
            }),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.userList,
            UserCustomBadgeUsersByBadgeButton.build({
              offset: "0",
              badgeId: badge.badgeId,
            }),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.userCustomBadgeAdmin.delete,
            UserCustomBadgeActionButton.build({
              action: "delete_badge",
              id: badge.badgeId,
            }),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.shared.back,
            UserCustomBadgeListButton.build({
              offset: String(backOffset),
            }),
          ),
        ],
      ]),
    };
  }

  static async getUserInfo(userId: number, offset: number = 0): Promise<LinkView> {
    const result = await UserCustomBadgeMapRepo.getAll(userId);
    if (!result.badges.length) {
      return {
        message: html`${i18n.userCustomBadgeAdmin.badgeNotFound}`,
      };
    }

    const username = await (async () => {
      try {
        const user = await UserService.get(userId);
        return user?.username ?? `<unknown>`;
      } catch {
        return `<unknown>`;
      }
    })();

    return {
      message: html`<b>${i18n.userCustomBadgeAdmin.userBadgeList}</b> ${username}`,
      keyboard: buildNav(
        result.badges.slice(offset, offset + PAGE_SIZE).map((badge) =>
          BotKeyboard.callback(
            `#${badge.badgeId}`,
            UserCustomBadgeActionButton.build({
              action: "view",
              id: badge.badgeId,
            }),
          ),
        ),
        {
          offset,
          hasNext: result.badges.length > offset + PAGE_SIZE,
          callbackBuilder: UserCustomBadgeUserInfoButton,
          callbackData: {
            id: String(userId),
            username,
          },
          backButtonCb: UserCustomBadgeUserListButton.build({
            offset: "0",
          }),
        },
      ),
    };
  }

  static async getList(offset: number = 0): Promise<LinkView> {
    const userList = await UserCustomBadgeRepo.getAll();
    const rawUserList = userList ?? [];
    const users = rawUserList.slice(offset, offset + PAGE_SIZE);

    return {
      message: html`<b>${i18n.userCustomBadgeAdmin.list}</b>: ${String(users.length)}
        ${i18n.shared.pcs}`,
      keyboard: buildNav(
        users.map((user) =>
          BotKeyboard.callback(
            `#${user.badgeId}`,
            UserCustomBadgeActionButton.build({
              action: "view",
              id: user.badgeId,
            }),
          ),
        ),
        {
          offset,
          hasNext: rawUserList.length > offset + PAGE_SIZE,
          callbackBuilder: UserCustomBadgeListButton,
          callbackData: {},
          backButtonCb: UserCustomBadgeStaticButton.build({
            action: "back",
          }),
        },
      ),
    };
  }
}
