import { subscribeMarketData } from "../../typescript/src/index.js";

const endpoint = process.env.POLARIS_DATA_WS_URL;
const apiKey = process.env.POLARIS_DATA_API_KEY;
const pool = process.env.POLARIS_DATA_POOL;

if (!endpoint || !apiKey || !pool) {
  throw new Error("set POLARIS_DATA_WS_URL, POLARIS_DATA_API_KEY, and POLARIS_DATA_POOL");
}

const handle = subscribeMarketData(
  {
    endpoint,
    apiKey,
    feed: "quote_surface",
    pair: process.env.POLARIS_DATA_PAIR ?? "SOL-USDC",
    pool,
    profile: (process.env.POLARIS_DATA_PROFILE as "fast" | "dense" | undefined) ?? "fast",
  },
  (event) => {
    if (event.type !== "quote_surface" && event.type !== "quote_surface_snapshot") return;
    console.log(JSON.stringify(event, null, 2));
    handle.close();
  },
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
