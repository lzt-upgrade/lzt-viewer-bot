import { z } from "zod";

const ZStringObj = z
  .string()
  .default("")
  .transform((value) => (value.trim() === "" ? [] : value.split(",").map((item) => item.trim())));

const r = z
  .object({
    API_ID: z.coerce.number(),
    API_HASH: z.string().min(1),
    BOT_TOKEN: z.string().min(1),
    LZT_API_TOKEN: z.string().min(1),
    LZT_API_DOMAIN: z.optional(z.string().min(1)),
    GROUP_IDS: ZStringObj.pipe(z.array(z.string().regex(/^-?\d+$/))).transform((items) =>
      items.map(Number),
    ),
    FORUM_DOMAINS: ZStringObj,
    FORUM_BASE: z.optional(z.string().min(1)).default("https://lolz.live"),
    MARKET_BASE: z.optional(z.string().min(1)).default("https://lzt.market"),
    LOCALE: z.optional(z.literal("ru").or(z.literal("en"))).default("ru"),
    PROXY_URL: z.optional(z.string().min(1)),
    REMOVE_HIDDEN_CONTENT_TAG: z.optional(z.coerce.boolean()).default(false),
  })
  .safeParse(process.env);

if (!r.success) {
  throw new Error(`Invalid env:\n${z.prettifyError(r.error)}`);
}

r.data.PROXY_URL = r.data.PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;

export const env = r.data;
