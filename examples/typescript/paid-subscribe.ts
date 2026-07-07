import { subscribeMarketData, type MarketDataFeed, type MarketDataProfile } from "../../typescript/src/index.js";

const endpoint = process.env.POLARIS_DATA_WS_URL;
const apiKey = process.env.POLARIS_DATA_API_KEY;
const feed = process.env.POLARIS_DATA_FEED as MarketDataFeed | undefined;

if (!endpoint || !apiKey || !feed) {
  throw new Error("set POLARIS_DATA_WS_URL, POLARIS_DATA_API_KEY, and POLARIS_DATA_FEED");
}

function isRequestedFeed(event: { type?: string }, feed: MarketDataFeed): boolean {
  switch (feed) {
    case "swaps":
      return event.type === "swap";
    case "liquidity_book":
      return event.type === "liquidity_book" || event.type === "liquidity_book_snapshot";
    case "quote_surface":
      return event.type === "quote_surface" || event.type === "quote_surface_snapshot";
    case "depth":
      return event.type === "depth" || event.type === "depth_snapshot";
  }
}

const handle = subscribeMarketData(
  {
    endpoint,
    apiKey,
    feed,
    pair: process.env.POLARIS_DATA_PAIR,
    pool: process.env.POLARIS_DATA_POOL,
    source: process.env.POLARIS_DATA_SOURCE,
    profile: process.env.POLARIS_DATA_PROFILE as MarketDataProfile | undefined,
  },
  (event) => {
    if (!isRequestedFeed(event, feed)) return;
    console.log(JSON.stringify(event, null, 2));
    handle.close();
  },
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
