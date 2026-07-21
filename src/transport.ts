import { HttpProxyTcpTransport } from "@mtcute/bun";
import { env } from "./env";

export const getTransport = (): HttpProxyTcpTransport | undefined => {
  if (!env.PROXY_URL) {
    return undefined;
  }

  const url = new URL(env.PROXY_URL);
  return new HttpProxyTcpTransport({
    host: url.hostname,
    port: Number.parseInt(url.port, 10),
    user: url.username,
    password: url.password,
    tls: url.protocol === "https:",
  });
};
