import { ForumClient } from "../api";
import { env } from "../env";
import { CURRENCY_SYMBOLS } from "./bbcode";

export const lzt = new ForumClient({
  apiToken: env.LZT_API_TOKEN,
  domain: env.LZT_API_DOMAIN,
});

export const USED_CURRENCY: string = await lzt
  .getUser("me" as const)
  .then(
    (user) => (CURRENCY_SYMBOLS as any)[user.currency] ?? CURRENCY_SYMBOLS.rub,
  )
  .catch(() => CURRENCY_SYMBOLS.rub);
