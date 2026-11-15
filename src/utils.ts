export const safeParseURL = (urlText: string): URL | undefined => {
  try {
    if (/http(s):\/\//.exec(urlText)) {
      return new URL(urlText);
    }

    return new URL(`https://${urlText}`);
  } catch {
    return undefined;
  }
};
