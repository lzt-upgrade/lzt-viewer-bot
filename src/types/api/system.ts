export type RatelimitInfo = {
  limit: number;
  remaining: number;
  reset: number;
};

export type SystemInfo = {
  visitor_id: number;
  time: number;
  log_id: number;
  rate_limit?: RatelimitInfo;
};

export type ResponseWithSystemInfo = {
  system_info: SystemInfo;
};

export type DeleteInfo = {
  user_id: number;
  username: string;
  username_html: string;
  date: number;
  reason: string;
};

export type DetailedTimestamp = {
  date: string;
  timezone_type: number;
  timezone: string;
};
