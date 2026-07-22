import { InlineKeyboardMarkup, TextWithEntities } from "@mtcute/bun";

export type ViewFactory = () => Promise<
  | {
      message: TextWithEntities;
      keyboard?: InlineKeyboardMarkup;
    }
  | undefined
>;
