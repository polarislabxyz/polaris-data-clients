import WebSocket from "ws";
import type { MarketDataEvent, SubscribeOptions } from "./types.js";

function cleanEndpoint(endpoint: string, hasApiKey: boolean): URL {
  const url = new URL(endpoint);
  if (url.protocol !== "ws:" && url.protocol !== "wss:") {
    throw new Error("endpoint must use ws:// or wss://");
  }
  if (hasApiKey && url.protocol !== "wss:") {
    throw new Error("authenticated streams require wss://");
  }
  if (url.username || url.password) {
    throw new Error("endpoint must not include username or password");
  }
  if (url.search) {
    throw new Error("endpoint must not include query parameters");
  }
  return url;
}

export function buildSubscribeUrl(options: SubscribeOptions): string {
  const url = cleanEndpoint(options.endpoint, Boolean(options.apiKey));
  url.searchParams.set("feed", options.feed);
  if (options.pair) url.searchParams.set("pair", options.pair);
  if (options.pool) url.searchParams.set("pool", options.pool);
  if (options.source) url.searchParams.set("source", options.source);
  if (options.profile) url.searchParams.set("profile", options.profile);
  return url.toString();
}

export interface StreamHandle {
  url: string;
  close: () => void;
}

export function subscribeMarketData(
  options: SubscribeOptions,
  onEvent: (event: MarketDataEvent) => void,
  onError?: (error: Error) => void,
): StreamHandle {
  const url = buildSubscribeUrl(options);
  const headers = options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : undefined;
  const ws = new WebSocket(url, { headers });

  ws.on("message", (data) => {
    try {
      const text = typeof data === "string" ? data : data.toString("utf8");
      onEvent(JSON.parse(text) as MarketDataEvent);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  });
  ws.on("error", (error) => onError?.(error instanceof Error ? error : new Error(String(error))));

  return {
    url,
    close: () => ws.close(),
  };
}
