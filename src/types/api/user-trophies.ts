import { ResponseWithSystemInfo } from "./system";

export const UserTrophyRarity = ["legendary", "mythical", "rare", "uncommon", "common"] as const;
export type UserTrophyRarity = (typeof UserTrophyRarity)[number];

export type UserTrophyLevelData = {
  url: string;
  title: string;
};

export type UserTrophy = {
  trophy_id: number;
  title: string;
  description: string;
  /**
   * image url
   */
  trophy_url: string;
  award_date: number;
  rarity: UserTrophyRarity;
  /**
   * 0.00 - 100
   */
  usersHasTrophyPercentage: number;
  rarityPhrase: string;
  /**
   * count of trophies with this trophy_id that user has
   */
  trophy_counter: number;
  /**
   * counter phrase
   */
  counter?: string;
  current_display_level?: number;
  available_levels?: Record<string, UserTrophyLevelData>;
};

export type UserTrophyResponse = ResponseWithSystemInfo & {
  trophies: UserTrophy[];
  trophyProgresses: unknown[];
};
