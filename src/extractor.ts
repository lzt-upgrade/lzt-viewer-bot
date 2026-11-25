import { TextWithEntities, tl } from "@mtcute/bun";
import { env } from "./env";
import { ENTITY_WITH_URL } from "./filters";
import { safeParseURL } from "./utils";

export type ExtractorId =
  | "thread"
  | "post"
  | "post-comment"
  | "profile-post"
  // | "profile-post-comment"
  | "member"
  | "custom";

export type BaseExtractor = {
  check: (url: URL) => RegExpExecArray | null;
  priority: number;
};

export type NumExtractor = BaseExtractor & {
  id: Exclude<ExtractorId, "custom">;
  extract: (data: RegExpExecArray) => number | undefined;
};
export type StrExtractor = BaseExtractor & {
  id: "custom";
  extract: (data: RegExpExecArray) => string | undefined;
};
export type Extractor = NumExtractor | StrExtractor;

export type NumExtractedLink = {
  id: NumExtractor["id"];
  priority: number;
  value: number;
};

export type StrExtractedLink = {
  id: StrExtractor["id"];
  priority: number;
  value: string;
};

export type ExtractedLink = NumExtractedLink | StrExtractedLink;

const THREAD_PATH_REGEX = /\/threads\/(\d+)/;
const POST_PATH_REGEX = /\/posts\/(\d+)/;
const POST_COMMENT_PATH_REGEX = /\/posts\/comments\/(\d+)/;
const PROFILE_POST_PATH_REGEX = /\/profile-posts\/(\d+)/;
// const PROFILE_POST_COMMENT_PATH_REGEX = /\/profile-posts\/comments\/(\d+)/;
const MEMBER_PATH_REGEX = /\/members\/(\d+)/;
const CUSTOM_PATH_REGEX =
  /^\/(?!(?:threads|rules|articles|guarantor|antipublic|members|banned|search|conversations|support-tickets|logout|login|register|(profile-)?posts|me)$)([a-zA-Z0-9-]+)\/?(page-\d+)?$/;

const DEFAULT_EXTRACT = (match: RegExpExecArray): number | undefined =>
  match.length > 1 ? Number(match[1]) : undefined;

export const isForumDomain = (url: URL) => {
  const hostname = url.hostname.toLowerCase();
  return env.FORUM_DOMAINS.some((domain) => hostname === domain);
};

export const extractors: Extractor[] = [
  {
    id: "thread",
    priority: 777,
    check: (url: URL) => THREAD_PATH_REGEX.exec(url.pathname),
    extract: DEFAULT_EXTRACT,
  },
  {
    id: "post",
    priority: 555,
    check: (url: URL) => POST_PATH_REGEX.exec(url.pathname),
    extract: DEFAULT_EXTRACT,
  },
  {
    id: "member",
    priority: 444,
    check: (url: URL) => MEMBER_PATH_REGEX.exec(url.pathname),
    extract: DEFAULT_EXTRACT,
  },
  {
    id: "post-comment",
    priority: 333,
    check: (url: URL) => POST_COMMENT_PATH_REGEX.exec(url.pathname),
    extract: DEFAULT_EXTRACT,
  },
  {
    id: "profile-post",
    priority: 333,
    check: (url: URL) => PROFILE_POST_PATH_REGEX.exec(url.pathname),
    extract: DEFAULT_EXTRACT,
  },
  // {
  //   id: "profile-post-comment",
  //   priority: 111,
  //   check: (url: URL) => PROFILE_POST_COMMENT_PATH_REGEX.exec(url.pathname),
  //   extract: DEFAULT_EXTRACT,
  // },
  {
    id: "custom",
    priority: -1,
    check: (url: URL) => CUSTOM_PATH_REGEX.exec(url.pathname),
    extract: (match: RegExpExecArray) => match[2],
  },
];

export const parseLztUserId = (text: string): number | undefined => {
  if (!/^\d*$/.test(text)) {
    return undefined;
  }

  const userId = Number(text);
  return Number.isSafeInteger(userId) ? userId : undefined;
};

export const extractMemberFromText = (text: string) => {
  const userId = parseLztUserId(text);
  if (userId) {
    return userId;
  }

  try {
    const url = new URL(text);
    const extracted = extractFromUrl(url);
    if (extracted && (extracted.id === "member" || extracted.id === "custom")) {
      return extracted.value;
    }
  } catch {}

  return undefined;
};

export const extractFromUrl = (url: URL): ExtractedLink | undefined => {
  if (!isForumDomain(url)) {
    return undefined;
  }

  for (const extractor of extractors) {
    const match = extractor.check(url);
    if (!match) {
      continue;
    }

    const value = extractor.extract(match);
    if (!value) {
      continue;
    }

    return {
      id: extractor.id,
      priority: extractor.priority,
      value,
    } as ExtractedLink;
  }

  return undefined;
};

export const extractEntitiesWithUrl = (
  textWithEntities: TextWithEntities,
): tl.TypeMessageEntity[] =>
  textWithEntities.entities?.filter((entity) => ENTITY_WITH_URL.includes(entity._)) ?? [];

export const messageEntityUrlToText = (
  textWithEntities: TextWithEntities,
  entity: tl.RawMessageEntityUrl,
) => {
  const offset = entity.offset;
  const textEnd = offset + entity.length;
  return textWithEntities.text.slice(offset, textEnd);
};

export const extractLinks = (textWithEntities: TextWithEntities): URL[] => {
  return extractEntitiesWithUrl(textWithEntities)
    .map((entity) => {
      switch (entity._) {
        case "messageEntityTextUrl":
          return safeParseURL(entity.url);
        case "messageEntityUrl":
          return safeParseURL(messageEntityUrlToText(textWithEntities, entity));
        default:
          return undefined;
      }
    })
    .filter((url): url is URL => url !== undefined);
};

export const extractForumLinks = (textWithEntities: TextWithEntities): ExtractedLink[] => {
  const extractedLinks = extractLinks(textWithEntities)
    .map((url) => extractFromUrl(url))
    .filter(Boolean) as ExtractedLink[];

  // remove duplicates
  return extractedLinks
    .filter((item) => item.value !== undefined)
    .filter(
      (item, index, array) =>
        index === array.findIndex((other) => other.id === item.id && other.value === item.value),
    )
    .sort((a, b) => b.priority - a.priority);
};
