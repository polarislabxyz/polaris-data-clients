import { subscribeMarketData } from "../../typescript/src/index.js";

const endpoint = process.env.PUBLIC_POLARIS_DATA_WS_URL ?? "wss://public-data.polarislab.xyz/ws/public";

const handle = subscribeMarketData(
  {
    endpoint,
    feed: "swaps",
    pair: "SOL-USDC",
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
