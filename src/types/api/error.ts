import type { ResponseWithSystemInfo } from "./system";

/**
 * system_info skipped if is 401 error
 */
export type LZTErrorResponse = Partial<ResponseWithSystemInfo> & {
  errors: string[];
};
