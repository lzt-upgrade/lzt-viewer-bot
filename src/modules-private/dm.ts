import { TelegramClient } from "@mtcute/bun";
import { MessageContext } from "@mtcute/dispatcher";

export async function initPrivateDM(msg: MessageContext, tg: TelegramClient) {
  try {
    const module = await import("./ubs/index.ts");
    return await module.init(msg, tg);
  } catch {
    return false;
  }
}
