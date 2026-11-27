import { html } from "@mtcute/html-parser";
import { BotKeyboard, InputMedia } from "@mtcute/bun";

import i18n from "../../i18n";
import { PostService } from "./service";
import { getTextByBBcode, extractFirstImageWithLimit } from "../../core/bbcode";
import { MemberButton } from "../user/keyboard";
import { ThreadButton } from "../thread/keyboard";

export abstract class PostView {
  static async getInfo(postId: number) {
    const post = await PostService.get(postId);
    if (!post) {
      console.log("No post found");
      return;
    }

    const messageText = getTextByBBcode(post.bbText, post.plainText);
    const firstImgUrl = extractFirstImageWithLimit(post.bbText, post.plainText);
    return {
      message: html`<b>📄 <a href="${post.link}"> ${i18n.post.main} </a> </b>
        ${i18n.post.by}
        <a href="${post.owner.link}"> ${post.owner.username} </a> <br /><br />

        <b>🖤 ${i18n.post.reacts}:</b>
        <a href="${post.reactions.link}">${post.reactions.count.toString()}</a><br />
        <b>🔍 ${i18n.post.content}:</b><br />
        ${messageText}`,
      keyboard: BotKeyboard.inline([
        [BotKeyboard.url(`🔗 ${i18n.post.go}`, post.link)],
        [
          BotKeyboard.callback(
            `🔎 ${i18n.post.authorInfo}`,
            MemberButton.build({
              id: String(post.owner.id),
              action: "info",
            }),
          ),
          BotKeyboard.callback(
            `🔍 ${i18n.post.threadInfo}`,
            ThreadButton.build({
              id: String(post.thread.id),
              action: "info",
            }),
          ),
        ],
      ]),
      ...(firstImgUrl
        ? {
            media: InputMedia.photo(firstImgUrl),
          }
        : {}),
    };
  }
}
