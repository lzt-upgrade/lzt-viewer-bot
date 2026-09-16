import { CallbackQueryContext, Dispatcher } from "@mtcute/dispatcher";
import { TelegramClient } from "@mtcute/bun";

import { filterCallbackKbBtn, selectedGroupFilter } from "./filters.ts";
import { env } from "./env.ts";
import { getTransport } from "./transport.ts";
import { ExtractedLink, extractForumLinks } from "./extractor.ts";
import { MemberButton } from "./modules/user/keyboard.ts";
import { linkToView } from "./core/view.ts";
import { UserView } from "./modules/user/view.ts";
import i18n from "./i18n/index.ts";
import { ThreadButton } from "./modules/thread/keyboard.ts";
import { ThreadView } from "./modules/thread/view.ts";
import { PostButton } from "./modules/post/keyboard.ts";
import { PostView } from "./modules/post/view.ts";
import { ViewFactory } from "./types/core.ts";
import { LinkToView } from "./types/view.ts";
import { UserTrophiesButton } from "./modules/user-trophies/keyboard.ts";
import { UserTrophiesView } from "./modules/user-trophies/view.ts";

const transport = getTransport();

const tg = new TelegramClient({
  apiId: env.API_ID,
  apiHash: env.API_HASH,
  storage: "bot-data/session",
  // undefined transport will throws error
  ...(transport
    ? {
        transport,
      }
    : {}),
});

const dp = Dispatcher.for(tg);

const actionHander = async (
  upd: CallbackQueryContext & {
    match: Record<"id" | "action", string>;
  },
  factory: ViewFactory,
  errorMessage: string,
) => {
  const message = await factory();
  const replyMarkup = filterCallbackKbBtn(message?.keyboard);
  await tg.sendEphemeralMessage(
    upd.chat.id,
    upd.user.id,
    message ? message.message : errorMessage,
    {
      replyMarkup,
    },
  );
};

dp.onCallbackQuery(MemberButton.filter({ action: "info" }), async (upd) => {
  await actionHander(upd, async () => await UserView.getInfo(upd.match.id), i18n.error.noUserFound);
});

dp.onCallbackQuery(UserTrophiesButton.filter({ action: "info" }), async (upd) => {
  const userId = Number.parseInt(upd.match.id);
  if (Number.isNaN(userId)) {
    return;
  }

  await actionHander(
    upd,
    async () => await UserTrophiesView.getInfo(userId),
    i18n.error.noUserFound,
  );
});

dp.onCallbackQuery(ThreadButton.filter({ action: "info" }), async (upd) => {
  await actionHander(
    upd,
    async () => await ThreadView.getInfo(Number.parseInt(upd.match.id)),
    i18n.error.noThreadFound,
  );
});

dp.onCallbackQuery(PostButton.filter({ action: "info" }), async (upd) => {
  await actionHander(
    upd,
    async () => await PostView.getInfo(Number.parseInt(upd.match.id)),
    i18n.error.noPostFound,
  );
});

dp.onNewMessage(selectedGroupFilter, async (msg) => {
  // const start = performance.now();
  const links = extractForumLinks(msg.textWithEntities);
  // const end = performance.now();
  // console.log(`Extracting links took ${end - start} ms.`);

  for (const link of links) {
    const linkViewFn = linkToView[
      link.id as keyof typeof linkToView
    ] as LinkToView<ExtractedLink>[typeof link.id];
    if (!linkViewFn) {
      console.log(`No view function found for link id: ${link.id}`);
      continue;
    }

    const message = await linkViewFn(link.value);
    if (!message) {
      continue;
    }

    if (message.media) {
      return void (await msg.answerMedia(message.media, {
        caption: message.message,
        replyMarkup: message.keyboard,
      }));
    }

    await msg.answerText(message.message, {
      disableWebPreview: true,
      replyMarkup: message.keyboard,
    });
    break;
  }
});

const user = await tg.start({ botToken: env.BOT_TOKEN });
console.log("Logged in as", user.username);
