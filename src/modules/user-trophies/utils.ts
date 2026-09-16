import type { UserTrophy, UserTrophyRarity } from "../../types/api/user-trophies";

/**
 * Trophy IDs from LZT API without game, symp, likes, messages trophies
 */
export enum Trophy {
  BugHunter = 70,
  BugHunterMobile = 176,
  /**
   * 10000+ views
   */
  ForumLegend = 167,
  /**
   * 5000+ views
   */
  InterestingPerson = 166,
  /**
   * maker of unique articles
   */
  ContentAuthor = 15,
  /**
   * 1000+ views
   */
  NotableUser = 165,
  NewYearSponsor = 150,
  TournamentSponsor = 77,
  Sponsor = 75,
  /**
   * Dev something for the forum
   */
  Developer = 116,
  /**
   * Dev addon for the forum
   */
  AddonGuru = 164,
  NewYearCharity = 161,
  Charity = 151,
  /**
   * Visit forum and get 1 symp + 1 message in a row from 15 december to 15 january
   */
  WinterActive = 74,
  /**
   * Visit forum and get 1 symp + 1 message in a row from 1 june to 31 august
   */
  SummerActive = 143,
  /**
   * Visit forum and get 1 symp + 1 message in a row year (365 days)
   */
  YearActive = 149,
  /**
   * Visit forum and get 1 symp + 1 message in a row 90 days
   */
  QuarterActive = 132,
  /**
   * Visit forum and get 1 symp + 1 message in a row month
   */
  Active = 32,
  /**
   * Visit forum and get 1 symp + 1 message in a row week
   */
  WeekActive = 31,
  /**
   * Seller without many bad reviews
   */
  HonestSeller = 13,
  RespectedUser = 14,
  TelegramSponsor = 97,
  /**
   * Request good idea that was implemented by forum team
   */
  Innovator = 40,
  ForumSupporter = 73,
  Mammoth2024 = 159,
  /**
   * 100 valid reports
   */
  Sleuth = 25,
  /**
   * 500 valid reports
   */
  Detective = 35,
  /**
   * 1000 valid reports
   */
  DetectiveAI = 141,
  /**
   * 5000 valid reports
   */
  CyberPolice = 41,
  /**
   * 2500 valid reports
   */
  Superintelligence = 39,
  /**
   * 1000 market reviews about seller
   */
  MarketReviews1k = 146,
  /**
   * 250 market reviews about seller
   */
  MarketReviews250 = 145,
  /**
   * 100 market reviews about seller
   */
  MarketReviews100 = 144,
  /**
   * 10000 sells in market
   */
  Magnate = 42,
  /**
   * 20000 sells in market
   */
  Sheikh = 66,
  /**
   * 2500 sells in market
   */
  TopSeller = 38,
  /**
   * 500 sells in market
   */
  FamousSeller = 36,
  /**
   * 100 sells in market
   */
  NewSeller = 37,
  /**
   * Create 1000 giveaways threads
   */
  Giveaways1k = 147,
  /**
   * Create 500 giveaways threads
   */
  Giveaways500 = 60,
  /**
   * Create 200 giveaways threads
   */
  Giveaways200 = 58,
  /**
   * Create 100 giveaways threads
   */
  Giveaways100 = 59,
  /**
   * Create 50 giveaways threads
   */
  Giveaways50 = 57,
  BirthdayEvent11 = 137,
  /**
   * 50 leaks 18+ threads with 1+ symp
   */
  LeakGuru = 80,
  HappyBirthday = 30,
}

export const trophyToViews = {
  [Trophy.ForumLegend]: 10000,
  [Trophy.InterestingPerson]: 5000,
  [Trophy.NotableUser]: 1000,
} as const;

export const trophyToSells = {
  [Trophy.Sheikh]: 20000,
  [Trophy.Magnate]: 10000,
  [Trophy.TopSeller]: 2500,
  [Trophy.FamousSeller]: 500,
  [Trophy.NewSeller]: 100,
} as const;

export const trophyToReviews = {
  [Trophy.MarketReviews1k]: 1000,
  [Trophy.MarketReviews250]: 250,
  [Trophy.MarketReviews100]: 100,
} as const;

export const trophyToReports = {
  [Trophy.CyberPolice]: 5000,
  [Trophy.Superintelligence]: 2500,
  [Trophy.DetectiveAI]: 1000,
  [Trophy.Detective]: 500,
  [Trophy.Sleuth]: 100,
} as const;

const mapToIds = (trophies: Record<number, number>) => {
  return Object.keys(trophies).map(Number) as Trophy[];
};

const filterByTrophyIds = (trophies: UserTrophy[], trophyIds: Trophy[]): UserTrophy[] => {
  return trophies.filter((trophy) => trophyIds.includes(trophy.trophy_id));
};

export const filterByRarity = (trophies: UserTrophy[], rarity: UserTrophyRarity): UserTrophy[] => {
  return trophies.filter((trophy) => trophy.rarity === rarity);
};

const predictByTrophyMap = (
  trophies: UserTrophy[],
  trophyMap: Record<number, number>,
): number | undefined => {
  return filterByTrophyIds(trophies, mapToIds(trophyMap)).map(
    (trophy) => trophyMap[trophy.trophy_id as keyof typeof trophyMap],
  )?.[0];
};

export const predictViews = (trophies: UserTrophy[] = []) => {
  return predictByTrophyMap(trophies, trophyToViews);
};

export const predictSells = (trophies: UserTrophy[] = []) => {
  return predictByTrophyMap(trophies, trophyToSells);
};

export const predictReviews = (trophies: UserTrophy[] = []) => {
  return predictByTrophyMap(trophies, trophyToReviews);
};

export const predictReports = (trophies: UserTrophy[] = []) => {
  return predictByTrophyMap(trophies, trophyToReports);
};

export function predictRemarks(trophies: UserTrophy[] = []) {
  const isBughunter = trophies.some((trophy) =>
    [Trophy.BugHunter, Trophy.BugHunterMobile].includes(trophy.trophy_id),
  );
  const isContentAuthor = trophies.some((trophy) => trophy.trophy_id === Trophy.ContentAuthor);
  const isSponsor = trophies.some((trophy) =>
    [
      Trophy.Sponsor,
      Trophy.NewYearSponsor,
      Trophy.TournamentSponsor,
      Trophy.TelegramSponsor,
    ].includes(trophy.trophy_id),
  );
  const isInnovator = trophies.some((trophy) => trophy.trophy_id === Trophy.Innovator);
  const isDeveloper = trophies.some((trophy) =>
    [Trophy.Developer, Trophy.AddonGuru].includes(trophy.trophy_id),
  );
  const isCharity = trophies.some((trophy) =>
    [Trophy.Charity, Trophy.NewYearCharity].includes(trophy.trophy_id),
  );
  const isHonestSeller = trophies.some((trophy) => trophy.trophy_id === Trophy.HonestSeller);
  const isForumSupporter = trophies.some((trophy) => trophy.trophy_id === Trophy.ForumSupporter);
  const isRespectedUser = trophies.some((trophy) => trophy.trophy_id === Trophy.RespectedUser);
  const isLeakGuru = trophies.some((trophy) => trophy.trophy_id === Trophy.LeakGuru);

  return {
    isBughunter,
    isContentAuthor,
    isSponsor,
    isInnovator,
    isDeveloper,
    isCharity,
    isHonestSeller,
    isForumSupporter,
    isRespectedUser,
    isLeakGuru,
  };
}
