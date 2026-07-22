import { html } from "@mtcute/html-parser";
import { BotKeyboard } from "@mtcute/bun";

import { ThreadService } from "./service";
import i18n from "../../i18n";
import { MemberButton } from "../user/keyboard";
import { getTextByBBcode } from "../../core/bbcode";

export abstract class ThreadView {
  static async getInfo(threadId: number) {
    const thread = await ThreadService.get(threadId);
    if (!thread?.bbText || !thread.plainText) {
      console.log("No plain text found for this thread");
      return;
    }

    let messageText = getTextByBBcode(thread.bbText, thread.plainText);
    return {
      message: html`<b>📄 ${i18n.thread.main}:</b> <a href="${thread.link}">${thread.title}</a
        ><br />
        <b>📝 ${i18n.thread.node}:</b>
        <a href="${thread.node.link}">${thread.node.title}</a><br />
        <b>👤 ${i18n.thread.author}:</b>
        <a href="${thread.owner.link}">${thread.owner.username}</a><br />
        <b>🔍 ${i18n.thread.content}:</b><br />
        ${messageText}`,
      keyboard: BotKeyboard.inline([
        [BotKeyboard.url(`🔗 ${i18n.thread.go}`, thread.link)],
        [
          BotKeyboard.callback(
            `🔎 ${i18n.thread.authorInfo}`,
            MemberButton.build({
              id: String(thread.owner.id),
              action: "info",
            }),
          ),
        ],
      ]),
    };
  }
}
