# `@polarislab/data-client`

Typed clients for Polaris live market-data streams and bounded historical
analytics. The analytics client targets `polaris.analytics.v2` and is generated
from the canonical gateway OpenAPI contract.

```ts
import { AnalyticsClient } from "@polarislab/data-client/analytics";

const analytics = new AnalyticsClient({
  baseUrl: process.env.POLARIS_ANALYTICS_URL!,
  apiKey: process.env.POLARIS_DATA_API_KEY,
});

const markets = await analytics.getMarkets();
```

Keep API keys in server-side code. See the repository README for bundled pair
timeseries, live WebSocket/gRPC examples, contract generation, and release
status.
