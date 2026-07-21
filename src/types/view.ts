import {
  InlineKeyboardMarkup,
  MaybePromise,
  TextWithEntities,
} from "@mtcute/bun";
import { ExtractedLink, NumExtractedLink } from "../extractor";

export type LinkView =
  | {
      message: TextWithEntities;
      keyboard?: InlineKeyboardMarkup;
    }
  | undefined;

export type LinkToView<T extends ExtractedLink = NumExtractedLink> = Record<
  T["id"],
  (value: T["value"]) => MaybePromise<LinkView>
>;
