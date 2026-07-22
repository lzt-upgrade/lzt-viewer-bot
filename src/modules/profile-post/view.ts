import { html } from "@mtcute/html-parser";
import { BotKeyboard } from "@mtcute/bun";

import i18n from "../../i18n";
import { ProfilePostService } from "./service";
import { getTextByBBcode } from "../../core/bbcode";
import { MemberButton } from "../user/keyboard";

export abstract class ProfilePostView {
  static async getInfo(profilePostId: number) {
    const profilePost = await ProfilePostService.get(profilePostId);
    if (!profilePost) {
      console.log("No profile post found");
      return;
    }

    const messageText = getTextByBBcode(profilePost.bbText, profilePost.plainText);

    return {
      message: html`<b>📄 <a href="${profilePost.link}">${i18n.profilePost.main}</a> </b>
        <a href="${profilePost.profile.link}">${profilePost.profile.username}</a>
        ${i18n.profilePost.by}
        <a href="${profilePost.owner.link}"> ${profilePost.owner.username} </a>
        <br /><br />
        <b>🖤 ${i18n.profilePost.likes}:</b>
        <a href="${profilePost.likes.link}">${profilePost.likes.count.toString()}</a><br />
        <b>✉️ ${i18n.profilePost.comments}:</b>
        <a href="${profilePost.comments.link}">${profilePost.comments.count.toString()}</a><br />
        <b>🔍 ${i18n.post.content}:</b><br />
        ${messageText}`,
      keyboard: BotKeyboard.inline([
        [BotKeyboard.url(`🔗 ${i18n.profilePost.go}`, profilePost.link)],
        [
          BotKeyboard.callback(
            `🔎 ${i18n.profilePost.authorInfo}`,
            MemberButton.build({
              id: String(profilePost.owner.id),
              action: "info",
            }),
          ),
          BotKeyboard.callback(
            `🔍 ${i18n.profilePost.profileInfo}`,
            MemberButton.build({
              id: String(profilePost.profile.id),
              action: "info",
            }),
          ),
        ],
      ]),
    };
  }
}
