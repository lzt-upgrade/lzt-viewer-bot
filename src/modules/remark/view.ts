import { html } from "@mtcute/html-parser";
import { BotKeyboard } from "@mtcute/bun";

import { LinkView } from "../../types/view";
import i18n from "../../i18n";
import {
  RemarkActionButton,
  RemarkListButton,
  RemarkStaticButton,
  RemarkUserInfoButton,
  RemarkUsersByBadgeButton,
} from "./keyboard";
import { buildNav, PAGE_SIZE } from "../../core/nav";
import { UserService } from "../user/service";
import { RemarkService } from "./service";

export abstract class RemarkAdmin {
  static async getUserListByBadge(remarkId: number, offset: number = 0): Promise<LinkView> {
    const { users, hasNext } = await RemarkService.getUsersByRemarkId(remarkId, offset, PAGE_SIZE);

    return {
      message: html`<b>${i18n.userCustomRemarkAdmin.userList}</b>`,
      keyboard: buildNav(
        users.map((user) => {
          return BotKeyboard.callback(
            user.username ?? `#${user.userId}`,
            RemarkUserInfoButton.build({
              id: String(user.userId),
              offset: "0",
            }),
          );
        }),
        {
          offset,
          hasNext,
          callbackBuilder: RemarkUsersByBadgeButton,
          callbackData: {
            remarkId: String(remarkId),
          },
          backButtonCb: RemarkActionButton.build({
            action: "view",
            id: String(remarkId),
          }),
        },
      ),
    };
  }

  static async getBadgeInfo(remarkId: number, backOffset: number = 0): Promise<LinkView> {
    const remark = await RemarkService.get(remarkId);
    if (!remark) {
      return {
        message: html`${i18n.userCustomRemarkAdmin.remarkNotFound}`,
      };
    }

    return {
      message: html`<b>${i18n.userCustomRemarkAdmin.remarkInfo}</b>
        #${remark.id}<br />"${remark.name}"`,
      keyboard: BotKeyboard.inline([
        [
          BotKeyboard.callback(
            i18n.userCustomRemarkAdmin.addToUser,
            RemarkActionButton.build({
              id: String(remark.id),
              action: "add_to_user",
            }),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.userCustomRemarkAdmin.takeoffRemark,
            RemarkActionButton.build({
              action: "takeoff_remark",
              id: String(remark.id),
            }),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.userCustomRemarkAdmin.userList,
            RemarkUsersByBadgeButton.build({
              offset: "0",
              remarkId: String(remark.id),
            }),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.userCustomRemarkAdmin.delete,
            RemarkActionButton.build({
              action: "delete_remark",
              id: String(remark.id),
            }),
          ),
        ],
        [
          BotKeyboard.callback(
            i18n.shared.back,
            RemarkListButton.build({
              offset: String(backOffset),
            }),
          ),
        ],
      ]),
    };
  }

  static async getUserInfo(userId: number, offset: number = 0): Promise<LinkView> {
    const result = await RemarkService.getAllByUserId(userId);
    if (!result.length) {
      return {
        message: html`${i18n.userCustomRemarkAdmin.remarkNotFound}`,
      };
    }

    const username = await (async () => {
      try {
        const user = await UserService.get(userId);
        if (!user?.username) {
          throw new Error("Failed to fetch username");
        }

        return user.username;
      } catch {
        return `<unknown>`;
      }
    })();

    return {
      message: html`<b>${i18n.userCustomRemarkAdmin.userRemarkList}</b> ${username}`,
      keyboard: buildNav(
        result.slice(offset, offset + PAGE_SIZE).map((remark) =>
          BotKeyboard.callback(
            `#${remark.remarkId}`,
            RemarkActionButton.build({
              action: "view",
              id: String(remark.remarkId),
            }),
          ),
        ),
        {
          offset,
          hasNext: result.length > offset + PAGE_SIZE,
          callbackBuilder: RemarkUserInfoButton,
          callbackData: {
            id: String(userId),
            username,
          },
          backButtonCb: RemarkListButton.build({
            offset: "0",
          }),
        },
      ),
    };
  }

  static async getList(offset: number = 0): Promise<LinkView> {
    const rawRemarks = await RemarkService.getAll(offset);
    const hasNext = rawRemarks.length > PAGE_SIZE;
    const remarks = hasNext ? rawRemarks.slice(0, PAGE_SIZE) : rawRemarks;

    const listKeyboard = buildNav(
      remarks.map((remark) =>
        BotKeyboard.callback(
          `"${remark.name}"`,
          RemarkActionButton.build({
            action: "view",
            id: String(remark.id),
          }),
        ),
      ),
      {
        offset,
        hasNext,
        callbackBuilder: RemarkListButton,
        callbackData: {},
      },
    );

    listKeyboard.buttons.push([
      BotKeyboard.callback(
        i18n.userCustomRemarkAdmin.create,
        RemarkStaticButton.build({
          action: "create",
        }),
      ),
    ]);

    return {
      message: html`<b>${i18n.userCustomRemarkAdmin.list}</b>`,
      keyboard: listKeyboard,
    };
  }
}
