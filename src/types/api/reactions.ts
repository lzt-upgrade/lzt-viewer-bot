export type ReactionData = {
  reaction_score: number;
  reaction_users: ReactionUser[];
  reactions: Record<string, number>;
};

export type ReactionUser = {
  user_id: number;
  username: string;
  reaction_id: number;
  quantity: number;
};
