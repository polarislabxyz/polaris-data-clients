import { subscribeMarketData, type MarketDataFeed, type MarketDataProfile } from "../../typescript/src/index.js";

const endpoint = process.env.POLARIS_DATA_WS_URL;
const apiKey = process.env.POLARIS_DATA_API_KEY;
const feed = process.env.POLARIS_DATA_FEED as MarketDataFeed | undefined;

if (!endpoint || !apiKey || !feed) {
  throw new Error("set POLARIS_DATA_WS_URL, POLARIS_DATA_API_KEY, and POLARIS_DATA_FEED");
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
    console.log(JSON.stringify(event, null, 2));
    handle.close();
  },
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
