import { Locale } from "../locale";

export type ForumOptions = {
  domain?: string;
  locale?: Locale;
  apiToken: string;
};

export type LZTSuccessResult<T> = {
  success: true;
  data: T;
};

export type LZTErrorResult = {
  success: false;
  error: Error;
};

export type LZTResult<T> = LZTSuccessResult<T> | LZTErrorResult;
