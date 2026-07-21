import { html } from "@mtcute/html-parser";
import { BotKeyboard } from "@mtcute/bun";

import i18n from "../../i18n";
import { PostCommentService } from "./service";
import { getTextByBBcode } from "../../core/bbcode";
import { MemberButton } from "../user/keyboard";
import { ThreadButton } from "../thread/keyboard";
import { PostButton } from "../post/keyboard";

export abstract class PostCommentView {
  static async getInfo(postCommentId: number) {
    const postComment = await PostCommentService.get(postCommentId);
    if (!postComment) {
      console.log("No post comment found");
      return;
    }

    const messageText = getTextByBBcode(
      postComment.bbText,
      postComment.plainText,
    );

    return {
      message: html`<b
          >📄 <a href="${postComment.link}">${i18n.post.main} </a>
        </b>
        ${i18n.post.by}
        <a href="${postComment.owner.link}"> ${postComment.owner.username} </a>
        ${i18n.post.to}
        <a href="${postComment.post.link}"> ${i18n.post.toComment}</a>
        <br /><br />

        <b>🖤 ${i18n.post.likes}:</b>
        <a href="${postComment.likes.link}"
          >${postComment.likes.count.toString()}</a
        ><br /><br />

        <b>🔍 ${i18n.post.content}:</b><br />
        ${messageText}`,
      keyboard: BotKeyboard.inline([
        [BotKeyboard.url(`🔗 ${i18n.post.go}`, postComment.link)],
        [
          BotKeyboard.callback(
            `🔎 ${i18n.post.authorInfo}`,
            MemberButton.build({
              id: String(postComment.owner.id),
              action: "info",
            }),
          ),
          BotKeyboard.callback(
            `🔍 ${i18n.post.threadInfo}`,
            ThreadButton.build({
              id: String(postComment.threadId),
              action: "info",
            }),
          ),
        ],
        [
          BotKeyboard.callback(
            `✉️ ${i18n.post.commentInfo}`,
            PostButton.build({
              id: String(postComment.post.id),
              action: "info",
            }),
          ),
        ],
      ]),
    };
  }
}
