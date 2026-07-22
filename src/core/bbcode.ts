import bbob from "@bbob/core";
import createPreset from "@bbob/preset";
import { render } from "@bbob/html";
import { getMemberPerma } from "../api/utils";
import { env } from "../env";
import { thtml } from "@mtcute/html-parser";
import { truncateHtml } from "./html";

type TagsDefination = Parameters<typeof createPreset>[0];
type TagDefinationFunc = TagsDefination[keyof TagsDefination];
type Tags = Record<string, TagDefinationFunc>;

const LOCALIZED_HIDDEN_CONTENT = env.LOCALE === "ru" ? "Скрытый контент" : "Hidden content";
const DEFAULT_SPOILER_TITLE = env.LOCALE === "ru" ? "Спойлер" : "Spoiler";
const DEFAULT_IMG_TEXT = "[IMG]";
const DEFAULT_MEDIA_TEXT = "[MEDIA]";
const DEFAULT_VISITOR_TEXT = "lztviewer";
const DEFAULT_VISITOR_LINK = "https://github.com/lzt-upgrade/lzt-viewer-bot";
const DEFAULT_API_TEXT = "[API]";
const DEFAULT_HIDDEN_CONTENT_TEXT = `[${LOCALIZED_HIDDEN_CONTENT}]`;
const TAGS_TO_CLEAN = ["size", "color", "tooltip", "left", "center", "right"] as const;
const CONTEXT_FREE_TAGS = ["code", "src", "srci", "plain", "php", "html"] as const;

// parsed from lzt.market
export const CURRENCY_SYMBOLS = {
  rub: "₽",
  uah: "₴",
  kzt: "₸",
  pln: "zł",
  usd: "$",
  eur: "€",
  gbp: "£",
  cny: "¥",
  try: "₺",
  jpy: "¥",
  byn: "Br",
  brl: "R$",
};

const MEDIA_BASES = {
  youtube: "https://www.youtube.com/watch?v=",
  coub: "https://coub.com/view/",
  imgur: "https://imgur.com/",
  ym: "https://music.yandex.ru/album/",
  reddit: "https://www.reddit.com/r/",
  rutube: "https://rutube.ru/video/",
  soundcloud: "https://soundcloud.com/",
  spotify: "https://open.spotify.com/track/",
  telegram: "https://t.me/",
  twitchvideo: "https://www.twitch.tv/videos/",
  twitch:
    "https://clips.twitch.tv/embed?parent=zelenka.guru&parent=lolz.guru&parent=lolz.live&clip=",
  vimeo: "https://vimeo.com/",
} as const;

const getFirstTag = (node: Parameters<TagDefinationFunc>[0]) => {
  const attrs = node.attrs as Record<string, string> | undefined;
  if (!attrs) {
    return undefined;
  }

  const key = Object.keys(attrs)[0];
  if (!(key in attrs)) {
    return undefined;
  }

  const value = attrs[key];
  const quotedValue = /^'(.+)'$|^"(.+)"$/.exec(value);
  if (quotedValue) {
    return (quotedValue[1] ?? quotedValue[2]).trim();
  }

  return attrs[key].split(";", 1)[0].trim();
};

const getNodeText = (node: Parameters<TagDefinationFunc>[0]) => {
  if (!node.content) {
    return "";
  }

  if (Array.isArray(node.content)) {
    return node.content.join("");
  }

  return node.content.toString();
};

const hiddenContentBBCode: TagDefinationFunc = () =>
  env.REMOVE_HIDDEN_CONTENT_TAG
    ? {
        tag: "span",
        content: [],
      }
    : {
        tag: "b",
        content: [DEFAULT_HIDDEN_CONTENT_TEXT],
      };

const bbcode: Tags = {
  b: (node) => ({
    tag: "b",
    content: node.content,
  }),
  i: (node) => ({
    tag: "i",
    content: node.content,
  }),
  u: (node) => ({
    tag: "u",
    content: node.content,
  }),
  s: (node) => ({
    tag: "s",
    content: node.content,
  }),
  url: (node) => {
    const href = getFirstTag(node);
    return {
      tag: "a",
      attrs: {
        href,
      },
      content: node.content,
    };
  },
  button: (node) => {
    const href = getFirstTag(node);
    return {
      tag: "a",
      attrs: {
        href,
      },
      content: node.content,
    };
  },
  email: (node) => {
    const href = getFirstTag(node);
    // telegram doesn't support mailto
    const text = getNodeText(node);
    console.log(href);
    return {
      tag: "span",
      content: href ? [`${text} (${href})`] : text,
    };
  },
  user: (node) => {
    const userId = getFirstTag(node);
    return {
      tag: "a",
      attrs: {
        href: userId ? getMemberPerma(Number(userId)) : undefined,
      },
      content: node.content,
    };
  },
  img: (node) => ({
    tag: "a",
    attrs: {
      href: node.content?.toString(),
    },
    content: [DEFAULT_IMG_TEXT],
  }),
  media: (node) => {
    const provider = getFirstTag(node);
    if (!provider || !(provider in MEDIA_BASES)) {
      return {
        tag: "span",
        content: [DEFAULT_MEDIA_TEXT],
      };
    }

    let pathname = getNodeText(node);
    if (provider === "soundcloud") {
      // idk wny lolz adds it
      pathname = pathname.replaceAll("soundcloud.com/", "");
    }

    return {
      tag: "a",
      attrs: {
        href: `${MEDIA_BASES[provider as keyof typeof MEDIA_BASES]}${pathname}`,
      },
      content: [DEFAULT_MEDIA_TEXT],
    };
  },
  api: () => ({
    tag: "span",
    content: [DEFAULT_API_TEXT],
  }),
  plain: (node) => ({
    tag: "span",
    content: node.content,
  }),
  visitor: () => ({
    tag: "a",
    attrs: {
      href: DEFAULT_VISITOR_LINK,
    },
    content: [DEFAULT_VISITOR_TEXT],
  }),
  spoiler: (node) => {
    let spoilerTitle = getFirstTag(node);
    if (spoilerTitle?.startsWith("align=")) {
      spoilerTitle = undefined;
    }

    return {
      tag: "spoiler",
      content: [
        {
          tag: "blockquote",
          attrs: {
            expandable: true,
          },
          content: [
            {
              tag: "b",
              content: spoilerTitle ?? DEFAULT_SPOILER_TITLE,
            },
            {
              tag: "br",
            },
            {
              tag: "br",
            },
            {
              tag: "span",
              content: node.content,
            },
          ],
        },
      ],
    };
  },
  quote: (node) => {
    const username = getFirstTag(node);
    const content = username ? [getNodeText(node), `\n(c) ${username}`] : node.content;
    return {
      tag: "blockquote",
      attrs: {
        expandable: true,
      },
      content,
    };
  },
  censor: (node) => ({
    tag: "spoiler",
    content: node.content,
  }),
  list: (node) => ({
    tag: "span",
    content: node.content,
  }),
  code: (node) => ({
    tag: "pre",
    content: node.content,
  }),
  php: (node) => ({
    tag: "pre",
    attrs: {
      language: "php",
    },
    content: node.content,
  }),
  html: (node) => ({
    tag: "pre",
    attrs: {
      language: "html",
    },
    content: node.content,
  }),
  src: (node) => {
    const lang = getFirstTag(node);
    return {
      tag: "pre",
      attrs: {
        language: lang,
      },
      content: node.content,
    };
  },
  srci: (node) => {
    const lang = getFirstTag(node);
    return {
      tag: "pre",
      attrs: {
        language: lang,
      },
      content: node.content,
    };
  },
  lang: (node) => {
    const lang = getFirstTag(node);
    if (lang !== "ru") {
      return {
        tag: "span",
        content: [],
      };
    }

    return {
      tag: "span",
      content: [
        {
          tag: "br",
        },
        {
          tag: "span",
          content: node.content,
        },
        {
          tag: "br",
        },
      ],
    };
  },
  "Скрытый контент": hiddenContentBBCode,
  "Hidden content": hiddenContentBBCode,
  price: (node) => {
    const currency = getFirstTag(node)?.toLowerCase() as keyof typeof CURRENCY_SYMBOLS | undefined;
    const currencySymbol = CURRENCY_SYMBOLS[currency ?? "rub"];
    return {
      tag: "span",
      content: [`${getNodeText(node)} ${currencySymbol}`],
    };
  },
  "*": (node) => ({
    tag: "span",
    content: [`• ${node.content}`],
  }),
  default: (node) => ({
    tag: "span",
    content: node.content,
  }),
};

const PRESET_CLEANER_TAGS = TAGS_TO_CLEAN.reduce<Tags>((result, tag) => {
  result[tag] = bbcode.default;
  result[tag.toUpperCase()] = bbcode.default;
  return result;
}, {});

const BBCODE_TAGS = Object.entries(bbcode).reduce<Tags>((result, [key, value]) => {
  if (key === "default") {
    return result;
  }

  result[key] = value;
  result[key.toUpperCase()] = value;
  return result;
}, {});

// https://github.com/JiLiZART/BBob/pull/316
const forumPreset = createPreset({
  ...BBCODE_TAGS,
  ...PRESET_CLEANER_TAGS,
});

export const transform = (bbText: string) => {
  return bbob(forumPreset()).process(bbText, {
    caseFreeTags: true,
    enableEscapeTags: true,
    contextFreeTags: CONTEXT_FREE_TAGS.reduce<string[]>((result, tag) => {
      result.push(tag, tag.toUpperCase());
      return result;
    }, []),
    render,
  });
};

export const getTextByBBcode = (bbText: string, plainText: string) => {
  if (bbText) {
    const text = truncateHtml(transform(bbText).html, 1024).replace(/(\n)+/g, "\n");
    return thtml(text);
  }

  if (plainText.length > 1024) {
    return `${plainText.slice(0, 1024)}...`;
  }

  return plainText;
};
