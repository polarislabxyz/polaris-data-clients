import { subscribeMarketData } from "../../typescript/src/index.js";

const endpoint = process.env.POLARIS_DATA_WS_URL;
const apiKey = process.env.POLARIS_DATA_API_KEY;

if (!endpoint || !apiKey) {
  throw new Error("set POLARIS_DATA_WS_URL and POLARIS_DATA_API_KEY");
}

const handle = subscribeMarketData(
  {
    endpoint,
    apiKey,
    feed: "depth",
    pair: process.env.POLARIS_DATA_PAIR ?? "SOL-USDC",
    profile: (process.env.POLARIS_DATA_PROFILE as "fast" | "dense" | undefined) ?? "dense",
  },
  (event) => {
    if (event.type !== "depth" && event.type !== "depth_snapshot") return;
    console.log(JSON.stringify(event, null, 2));
    handle.close();
  },
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
