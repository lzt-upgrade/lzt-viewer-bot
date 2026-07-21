import { html } from "@mtcute/html-parser";
import { BotKeyboard } from "@mtcute/bun";

import i18n from "../../i18n";
import { UserService } from "./service";
import { USED_CURRENCY } from "../../core/lzt";

export abstract class UserView {
  static async getInfo(userIdOrSlug: number | string) {
    const user = await UserService.get(userIdOrSlug);
    if (!user) {
      console.log("No user found");
      return;
    }

    const bannedEmoji = user.banInfo.banned ? "🚫" : "✅";
    const banReason = user.banInfo.banned
      ? user.banInfo.reason
      : i18n.user.isBanned.false;

    const messageHead = html`<b>👤 ${i18n.user.main}:</b>
      <a href="${user.link}">${user.username}</a> | 🆔
      <a href="${user.link}">${user.id}</a> <br />
      <b>💫 ${i18n.user.group}:</b> ${user.group}<br />
      <b>🖥 ${i18n.user.predictedGroup}:</b>
      ${user.predictedGroup}<br />`;

    // you need use toString else it will be cleared if value === 0
    const depositField = user.deposit
      ? html`<b>💰 ${i18n.user.deposit}:</b>
          ${user.deposit.toString()}${USED_CURRENCY}<br />`
      : "";
    const messageBody = html`${depositField}
      <b>✉️ ${i18n.user.messages}:</b>
      <a href="${user.links.messages}">${user.messages.toString()}</a><br />
      <b>❤️ ${i18n.user.sympathies}:</b>
      <a href="${user.links.sympathies}">${user.sympathies.toString()}</a><br />
      <b>🖤 ${i18n.user.likes}:</b>
      <a href="${user.links.likes}">${user.likes.toString()}</a><br />
      <b>🏆 ${i18n.user.trophies}:</b>
      <a href="${user.links.trophies}">${user.trophies.toString()}</a><br />
      <b>👥 ${i18n.user.followers}:</b>
      <a href="${user.links.followers}">${user.followers.toString()}</a><br />
      <b>👀 ${i18n.user.followings}:</b>
      <a href="${user.links.followings}">${user.followings.toString()}</a><br />
      <b>ℹ️ ${i18n.user.status}:</b>
      <code>${user.status}</code>
      <br />`;
    const messageFooter = html`<b>${bannedEmoji} ${i18n.user.isBanned.main}:</b>
      ${banReason}`;

    return {
      message: html`${messageHead}
        <br />
        ${messageBody}
        <br />
        ${messageFooter}`,
      keyboard: BotKeyboard.inline([
        [BotKeyboard.url(`🔗 ${i18n.user.go}`, user.link)],
        ...(user.links.telegram
          ? [[BotKeyboard.url("💬 Telegram", user.links.telegram)]]
          : []),
      ]),
    };
  }
}
