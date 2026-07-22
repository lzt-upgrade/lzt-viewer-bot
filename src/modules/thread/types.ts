export type ThreadOwnerData = {
  id: number;
  username: string;
  link: string;
};

export type ThreadNodeData = {
  id: number;
  title: string;
  link: string;
};

export type ThreadData = {
  id: number;
  title: string;
  owner: ThreadOwnerData;
  createdAt: number;
  updatedAt: number;
  posts: number;
  views: number;
  likes: number;
  link: string;
  plainText: string;
  bbText: string;
  node: ThreadNodeData;
};

export type CreateThreadData = Omit<ThreadData, "id">;
