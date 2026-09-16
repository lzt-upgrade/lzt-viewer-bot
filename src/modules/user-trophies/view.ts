import { html } from "@mtcute/html-parser";
import { BotKeyboard } from "@mtcute/bun";
import { joinTextWithEntities } from "@mtcute/bun/utils.js";

import { UserTrophiesService } from "./service";
import i18n from "../../i18n";
import { getMemberPerma } from "../../api/utils";
import { filterByRarity } from "./utils";
import { UserTrophyRarity } from "../../types/api/user-trophies";

const rarityEmojiMap: Record<UserTrophyRarity, string> = {
  legendary: "🏆",
  rare: "🥇",
  mythical: "🌟",
  uncommon: "🥈",
  common: "🥉",
} as const;

export abstract class UserTrophiesView {
  static async getInfo(userId: number) {
    const userTrophies = await UserTrophiesService.get(userId);
    const userLink = getMemberPerma(userId);

    const title = html(`${i18n.trophies.mainHtml.replace("{0}", userLink)}`);
    const keyboard = BotKeyboard.inline([[BotKeyboard.url(`🔗 ${i18n.trophies.go}`, userLink)]]);
    if (!userTrophies || userTrophies.length === 0) {
      return {
        message: html`<b>🏆 ${title}:</b><br />${i18n.trophies.noTrophies}`,
        keyboard,
      };
    }

    let messageText = html``;
    for (const rarity of UserTrophyRarity) {
      const trophiesOfRarity = filterByRarity(userTrophies, rarity);
      const rarityName = i18n.trophies.rarities[rarity];
      const trophiesText = joinTextWithEntities(
        trophiesOfRarity.map((trophy) => {
          let title = html`${trophy.title}`;

          if (trophy.counter) {
            title = html`${title} (<b>${trophy.counter}</b>)`;
          } else if (trophy.trophy_counter > 1) {
            title = html`${title} (<b>${trophy.trophy_counter}</b>)`;
          }

          return html`- ${title}`;
        }),
        html`<br />`,
      );

      if (trophiesOfRarity.length > 0) {
        messageText = joinTextWithEntities([
          messageText,
          html`<b>${rarityEmojiMap[rarity]} ${rarityName}:</b><br />${trophiesText}<br /><br />`,
        ]);
      }
    }

    return {
      message: html`<b>🏆 ${title}:</b><br /><br />
        ${messageText}`,
      keyboard,
    };
  }
}
