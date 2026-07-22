import parse from "node-html-parser";
import { User } from "../../types/api/user";
import i18n from "../../i18n";

export const GROUPS_WITH_BANNER: readonly string[] = [
  "admin",
  "Ikarus",
  "Greatest",
  "Legend",
  "headDesigner",
  "coder",
  "main_arbitr",
  "main_moder",
  "Designer",
  "moder",
  "sponsor",
  "zelenkaWork",
  "curator",
  "discord",
  "editor",
  "telegramBot",
  "telegramChat",
  "smm",
] as const;

export const SIMPLE_GROUPS: readonly string[] = [
  "newbie",
  "local",
  "resident",
  "expert",
  "guru",
  "banned",
] as const;

export const DEFAULT_USER_BANNER_CLASSES = ["userBanner", "wrapped"];

export function parseUserBanner(banner: string) {
  if (!banner) {
    return undefined;
  }

  try {
    const root = parse(banner);
    const userBanners = root.querySelectorAll(".userBanner");
    return userBanners
      .map((banner) =>
        Array.from(banner.classList.values()).filter(
          (bannerClass) => !DEFAULT_USER_BANNER_CLASSES.includes(bannerClass),
        ),
      )
      .flat()
      .filter((bannerClass) => bannerClass && GROUPS_WITH_BANNER.includes(bannerClass));
  } catch {
    return undefined;
  }
}

export function sympathiesToGroup(sympathies: number): string | undefined {
  if (sympathies < 20) {
    return i18n.group.newbie;
  }

  if (sympathies >= 111_111) {
    return i18n.group.Greatest;
  }

  if (sympathies >= 10_000) {
    return i18n.group.Ikarus;
  }

  if (sympathies >= 4000) {
    return i18n.group.guru;
  }

  if (sympathies >= 1000) {
    return i18n.group.expert;
  }

  if (sympathies >= 200) {
    return i18n.group.resident;
  }

  return i18n.group.local;
}

export function hasUniqGroup(user: User): boolean {
  try {
    const root = parse(user.username_html);
    return !!root.querySelector(".uniqUsernameIcon--custom");
  } catch {
    return false;
  }
}

export function predictGroup(user: User): string | undefined {
  const groupsByBanner = parseUserBanner(user.banner);
  // i prefer add priority to other groups, because Ikarus can be converted by sympathies
  if (groupsByBanner?.length && !(groupsByBanner.length === 1 && groupsByBanner[0] === "Ikarus")) {
    return groupsByBanner.map((group) => (i18n.group as any)[group]).join(", ");
  }

  if (user.curator_titles?.length) {
    return i18n.group.curator;
  }

  if (hasUniqGroup(user)) {
    return i18n.group.uniq;
  }

  return sympathiesToGroup(user.user_like_count);
}
