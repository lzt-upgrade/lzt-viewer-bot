import { InlineKeyboardMarkup, MaybePromise, TextWithEntities, InputMediaPhoto } from "@mtcute/bun";
import { ExtractedLink, NumExtractedLink } from "../extractor";

export type LinkView =
  | {
      message: TextWithEntities;
      keyboard?: InlineKeyboardMarkup;
      media?: InputMediaPhoto;
    }
  | undefined;

export type LinkToView<T extends ExtractedLink = NumExtractedLink> = Record<
  T["id"],
  (value: T["value"]) => MaybePromise<LinkView>
>;
