import { html } from "@mtcute/html-parser";
import { BotKeyboard, InputMedia } from "@mtcute/bun";
import i18n from "../../i18n";
import { UserService } from "./service";
import { USED_CURRENCY } from "../../core/lzt";
import { LinkView } from "../../types/view";
import { env } from "../../env";
import { UserTrophiesButton } from "../user-trophies/keyboard";

export abstract class UserView {
  static async getInfo(userIdOrSlug: number | string): Promise<LinkView> {
    const user = await UserService.get(userIdOrSlug);
    if (!user) {
      console.log("No user found");
      return;
    }

    const bannedEmoji = user.banInfo.banned ? "🚫" : "✅";
    const banReason = user.banInfo.banned ? user.banInfo.reason : i18n.user.isBanned.false;

    const remarkField = (() => {
      if (!user.remarks) {
        return "";
      }

      const remarksText = Object.entries(user.remarks)
        .filter(([key, value]) => key !== "isHonestSeller" && value)
        .map(([key, _]) => i18n.user.remarks[key as keyof typeof i18n.user.remarks])
        .join(", ");

      return remarksText ? html`<b>📌 ${i18n.user.remarks.title}:</b> ${remarksText}<br />` : "";
    })();

    const messageHead = html`<b>👤 ${i18n.user.main}:</b>
      <a href="${user.link}">${user.username}</a> | 🆔 <a href="${user.link}">${user.id}</a> <br />
      <b>💫 ${i18n.user.group}:</b> ${user.group}<br />
      <b>🖥 ${i18n.user.predictedGroup}:</b>
      ${user.predictedGroup}<br />
      ${remarkField}`;

    // you need use toString else it will be cleared if value === 0
    const depositField = user.deposit
      ? html`<b>💰 ${i18n.user.deposit}:</b> ${user.deposit.toString()}${USED_CURRENCY}<br />`
      : "";
    const createdAtValue = new Date(user.createdAt * 1000).toLocaleDateString(env.LOCALE, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const viewsField = user.views
      ? html`<b>👀 ${i18n.user.views}:</b> ${user.views.toString()}+<br />`
      : "";
    const sellsField = (() => {
      if (!user.sells) {
        return "";
      }

      let sellsField = html`<b>🛒 ${i18n.user.sells}:</b>
        <a href="${user.links.market}">${user.sells.toString()}+</a>`;
      const { isHonestSeller } = user.remarks;
      if (!isHonestSeller && !user.reviews) {
        return html`${sellsField}<br />`;
      }

      let reviewsField = html``;
      if (user.reviews) {
        reviewsField = html`<a href="${user.links.market}">${user.reviews.toString()}+</a> ${i18n
            .user.reviews}`;
      }

      if (isHonestSeller) {
        let text = html`✅ ${i18n.user.remarks.isHonestSeller}`;
        reviewsField = reviewsField.text ? html`${text}, ${reviewsField}` : text;
      }

      return html`${sellsField} (${reviewsField})<br />`;
    })();
    const reportsField = user.reports
      ? html`<b>📢 ${i18n.user.reports}:</b>
          <a href="${user.links.reports}">${user.reports.toString()}+</a><br />`
      : "";
    const messageBody = html`${depositField}
      <b>✉️ ${i18n.user.messages}:</b>
      <a href="${user.links.messages}">${user.messages.toString()}</a><br />
      <b>❤️ ${i18n.user.sympathies}:</b>
      <a href="${user.links.sympathies}">${user.sympathies.toString()}</a><br />
      <b>🖤 ${i18n.user.likes}:</b>
      <a href="${user.links.likes}">${user.likes.toString()}</a><br />
      ${viewsField} ${sellsField} ${reportsField}
      <b>🏆 ${i18n.user.trophies}:</b>
      <a href="${user.links.trophies}">${user.trophies.toString()}</a><br />
      <b>👥 ${i18n.user.followers}:</b>
      <a href="${user.links.followers}">${user.followers.toString()}</a><br />
      <b>👤 ${i18n.user.followings}:</b>
      <a href="${user.links.followings}">${user.followings.toString()}</a><br />
      <b>📅 ${i18n.user.registeredAt}:</b>
      <b>${createdAtValue}</b><br />
      <b>ℹ️ ${i18n.user.status}:</b>
      <code>${user.status}</code>
      <br />`;
    const messageFooter = html`<b>${bannedEmoji} ${i18n.user.isBanned.main}:</b> ${banReason}`;

    return {
      message: html`${messageHead}
        <br />
        ${messageBody}
        <br />
        ${messageFooter}`,
      keyboard: BotKeyboard.inline([
        user.trophies
          ? [
              BotKeyboard.callback(
                `🏆 ${i18n.user.trophiesInfo}`,
                UserTrophiesButton.build({
                  id: String(user.id),
                  action: "info",
                }),
              ),
            ]
          : [],
        [BotKeyboard.url(`🔗 ${i18n.user.go}`, user.link)],
        ...(user.links.telegram ? [[BotKeyboard.url("💬 Telegram", user.links.telegram)]] : []),
      ]),
      ...(user.links.avatarUrl
        ? {
            media: InputMedia.photo(user.links.avatarUrl),
          }
        : {}),
    };
  }
}
