export interface paths {
    "/v2/analytics/markets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Latest 24-hour market overview */
        get: operations["getMarkets"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/analytics/network/solana/timeseries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Solana network timeseries */
        get: operations["getNetworkTimeseries"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/analytics/tokens/{mint}/timeseries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Non-additive token-participation timeseries */
        get: operations["getTokenTimeseries"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/analytics/pairs/{pair_id}/timeseries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Canonical-pair bundled timeseries
         * @description One call can return activity, volume composition, venue and pool volume, and the six-rung routed-liquidity curve used by the dashboard.
         */
        get: operations["getPairTimeseries"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/analytics/assets/{mint}/prices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** USD asset price series */
        get: operations["getAssetPrices"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/analytics/methodology": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Methodology epoch catalog */
        get: operations["getMethodology"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/analytics/foundation/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Public final daily Foundation metric adapter */
        get: operations["getFoundationMetrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @constant */
        SchemaVersion: "polaris.analytics.v2";
        UIntString: string;
        DecimalString: string;
        /** Format: date */
        Day: string;
        SolanaMint: string;
        PairId: string;
        /** @enum {string} */
        ValueStatus: "provisional" | "final" | "restated";
        /** @enum {string} */
        ScopeResolution: "5s" | "5m" | "1h" | "1d";
        /** @enum {string} */
        PriceResolution: "1m" | "1d";
        /** @enum {string} */
        Dataset: "activity" | "volume_composition" | "venue_volume" | "routed_liquidity";
        /** @enum {string} */
        FlowBucket: "non_arb_observed" | "atomic_arb" | "unclassified";
        /** @enum {string} */
        ArbTopology: "active_active" | "active_passive" | "passive_passive" | "unknown" | "not_applicable";
        /** @enum {string} */
        LiquidityMechanism: "maker_driven" | "curve_driven" | "unknown";
        Coverage: {
            completeness_bps: number;
            pricing_coverage_bps: number | null;
            identity_coverage_bps: number | null;
            reason: string | null;
        };
        NetworkScope: {
            /** @constant */
            kind: "network";
            identity: {
                /** @constant */
                network: "solana";
            };
        };
        TokenScope: {
            /** @constant */
            kind: "token";
            identity: {
                mint: components["schemas"]["SolanaMint"];
                symbol: string | null;
                /** @constant */
                non_additive: true;
            };
        };
        PairIdentity: {
            pair_id: components["schemas"]["PairId"];
            base_mint: components["schemas"]["SolanaMint"];
            quote_mint: components["schemas"]["SolanaMint"];
            base_symbol: string | null;
            quote_symbol: string | null;
        };
        PairScope: {
            /** @constant */
            kind: "pair";
            identity: components["schemas"]["PairIdentity"];
        };
        Scope: components["schemas"]["NetworkScope"] | components["schemas"]["TokenScope"] | components["schemas"]["PairScope"];
        QueryWindow: {
            start_ms: components["schemas"]["UIntString"];
            end_ms: components["schemas"]["UIntString"];
            resolution: components["schemas"]["ScopeResolution"];
            status: components["schemas"]["ValueStatus"];
            included: components["schemas"]["Dataset"][];
        };
        ActivityPoint: {
            bucket_start_ms: components["schemas"]["UIntString"];
            dex_volume_usd: components["schemas"]["DecimalString"] | null;
            economic_trade_volume_usd: components["schemas"]["DecimalString"] | null;
            dex_transactions: components["schemas"]["UIntString"];
            economic_trade_count: components["schemas"]["UIntString"];
            venue_leg_count: components["schemas"]["UIntString"];
            resolved_trader_count: components["schemas"]["UIntString"] | null;
            unresolved_trade_count: components["schemas"]["UIntString"];
            dex_count: components["schemas"]["UIntString"];
            route_amplification: number | null;
        };
        ActivityDataset: {
            coverage: components["schemas"]["Coverage"];
            points: components["schemas"]["ActivityPoint"][];
        };
        VolumeCompositionDimensions: {
            flow_bucket: components["schemas"]["FlowBucket"];
            arb_topology: components["schemas"]["ArbTopology"];
            liquidity_mechanism: components["schemas"]["LiquidityMechanism"];
        };
        VolumePoint: {
            bucket_start_ms: components["schemas"]["UIntString"];
            volume_usd: components["schemas"]["DecimalString"];
            venue_leg_count: components["schemas"]["UIntString"];
            priced_leg_count: components["schemas"]["UIntString"];
            unpriced_leg_count: components["schemas"]["UIntString"];
        };
        VolumeCompositionSeries: {
            dimensions: components["schemas"]["VolumeCompositionDimensions"];
            coverage: components["schemas"]["Coverage"];
            points: components["schemas"]["VolumePoint"][];
        };
        VenueVolumeDimensions: {
            protocol_id: string;
            protocol_version: string;
            venue_kind: string;
            venue_label: string;
            program_id: string | null;
            pool_id: string | null;
            flow_bucket: components["schemas"]["FlowBucket"];
            arb_topology: components["schemas"]["ArbTopology"];
            liquidity_mechanism: components["schemas"]["LiquidityMechanism"];
        };
        VenueVolumeSeries: {
            dimensions: components["schemas"]["VenueVolumeDimensions"];
            coverage: components["schemas"]["Coverage"];
            points: components["schemas"]["VolumePoint"][];
        };
        RoutedRungSupport: {
            supported: boolean;
            reason: string | null;
        };
        NullableNumberArray: (number | null)[];
        UIntStringArray6: components["schemas"]["UIntString"][];
        RoutedLiquidityPoint: {
            bucket_start_ms: components["schemas"]["UIntString"];
            buy_cost_p50_bps: components["schemas"]["NullableNumberArray"];
            buy_cost_p95_bps: components["schemas"]["NullableNumberArray"];
            sell_cost_p50_bps: components["schemas"]["NullableNumberArray"];
            sell_cost_p95_bps: components["schemas"]["NullableNumberArray"];
            two_sided_cost_p50_bps: components["schemas"]["NullableNumberArray"];
            two_sided_cost_p95_bps: components["schemas"]["NullableNumberArray"];
            supported_sample_count: components["schemas"]["UIntStringArray6"];
            eligible_sample_count: components["schemas"]["UIntStringArray6"];
            coverage_bps: number[];
            bid_capacity_p05_usd: components["schemas"]["DecimalString"] | null;
            bid_capacity_p50_usd: components["schemas"]["DecimalString"] | null;
            ask_capacity_p05_usd: components["schemas"]["DecimalString"] | null;
            ask_capacity_p50_usd: components["schemas"]["DecimalString"] | null;
            min_contributor_count: components["schemas"]["UIntString"];
            median_contributor_count: components["schemas"]["DecimalString"];
            max_contributor_age_ms: components["schemas"]["UIntString"];
            support: components["schemas"]["RoutedRungSupport"][];
        };
        RoutedLiquidityDataset: {
            size_usd: components["schemas"]["DecimalString"][];
            coverage: components["schemas"]["Coverage"];
            points: components["schemas"]["RoutedLiquidityPoint"][];
        };
        TimeseriesDatasets: {
            activity: components["schemas"]["ActivityDataset"] | null;
            volume_composition: components["schemas"]["VolumeCompositionSeries"][] | null;
            venue_volume: components["schemas"]["VenueVolumeSeries"][] | null;
            routed_liquidity: components["schemas"]["RoutedLiquidityDataset"] | null;
        };
        ScopeTimeseriesDocument: {
            schema_version: components["schemas"]["SchemaVersion"];
            scope: components["schemas"]["Scope"];
            query: components["schemas"]["QueryWindow"];
            methodology_epoch: string;
            highest_revision: components["schemas"]["UIntString"];
            event_watermark_ms: components["schemas"]["UIntString"];
            coverage: components["schemas"]["Coverage"];
            datasets: components["schemas"]["TimeseriesDatasets"];
        };
        MarketVolumeComposition: {
            dimensions: components["schemas"]["VolumeCompositionDimensions"];
            volume_usd: components["schemas"]["DecimalString"];
            venue_leg_count: components["schemas"]["UIntString"];
            priced_leg_count: components["schemas"]["UIntString"];
            unpriced_leg_count: components["schemas"]["UIntString"];
        };
        MarketRoutedLiquidity: {
            size_usd: components["schemas"]["DecimalString"][];
            point: components["schemas"]["RoutedLiquidityPoint"];
        };
        MarketNetworkSummary: {
            dex_volume_usd: components["schemas"]["DecimalString"] | null;
            economic_trade_volume_usd: components["schemas"]["DecimalString"] | null;
            dex_transactions: components["schemas"]["UIntString"];
            economic_trade_count: components["schemas"]["UIntString"];
            resolved_trader_count: components["schemas"]["UIntString"];
            dex_count: components["schemas"]["UIntString"];
            route_amplification: number | null;
            volume_composition: components["schemas"]["MarketVolumeComposition"][];
            coverage: components["schemas"]["Coverage"];
        };
        MarketSummary: {
            pair: components["schemas"]["PairIdentity"];
            dex_volume_usd: components["schemas"]["DecimalString"] | null;
            economic_trade_volume_usd: components["schemas"]["DecimalString"] | null;
            dex_transactions: components["schemas"]["UIntString"];
            economic_trade_count: components["schemas"]["UIntString"];
            resolved_trader_count: components["schemas"]["UIntString"];
            volume_composition: components["schemas"]["MarketVolumeComposition"][];
            routed_liquidity: components["schemas"]["MarketRoutedLiquidity"] | null;
            coverage: components["schemas"]["Coverage"];
        };
        MarketsDocument: {
            schema_version: components["schemas"]["SchemaVersion"];
            /** @constant */
            window: "24h";
            status: components["schemas"]["ValueStatus"];
            methodology_epoch: string;
            highest_revision: components["schemas"]["UIntString"];
            event_watermark_ms: components["schemas"]["UIntString"];
            coverage: components["schemas"]["Coverage"];
            network: components["schemas"]["MarketNetworkSummary"];
            sol_price_usd: components["schemas"]["DecimalString"] | null;
            markets: components["schemas"]["MarketSummary"][];
        };
        AssetIdentity: {
            mint: components["schemas"]["SolanaMint"];
            symbol: string | null;
            /** @constant */
            quote_currency: "USD";
        };
        PricePoint: {
            bucket_start_ms: components["schemas"]["UIntString"];
            open_usd: components["schemas"]["DecimalString"] | null;
            high_usd: components["schemas"]["DecimalString"] | null;
            low_usd: components["schemas"]["DecimalString"] | null;
            close_usd: components["schemas"]["DecimalString"] | null;
            twap_usd: components["schemas"]["DecimalString"] | null;
            null_reason: string | null;
        };
        PricesDocument: {
            schema_version: components["schemas"]["SchemaVersion"];
            scope: components["schemas"]["AssetIdentity"];
            resolution: components["schemas"]["PriceResolution"];
            status: components["schemas"]["ValueStatus"];
            methodology_epoch: string;
            highest_revision: components["schemas"]["UIntString"];
            event_watermark_ms: components["schemas"]["UIntString"];
            coverage: components["schemas"]["Coverage"];
            points: components["schemas"]["PricePoint"][];
        };
        MethodologyEpoch: {
            epoch: string;
            effective_start_ms: components["schemas"]["UIntString"];
            effective_end_ms: components["schemas"]["UIntString"] | null;
            content_hash: string;
        };
        MethodologyDocument: {
            schema_version: components["schemas"]["SchemaVersion"];
            active_epoch: string;
            epochs: components["schemas"]["MethodologyEpoch"][];
        };
        /** @enum {string} */
        FoundationMetric: "overview_sol_price" | "defi_dex_volume" | "defi_dex_transactions" | "defi_dex_count";
        FoundationMetricPoint: {
            day: components["schemas"]["Day"];
            value: components["schemas"]["DecimalString"];
            revision: components["schemas"]["UIntString"];
            methodology_epoch: string;
        };
        FoundationDocument: {
            schema_version: components["schemas"]["SchemaVersion"];
            metric: components["schemas"]["FoundationMetric"];
            /** @constant */
            status: "final";
            points: components["schemas"]["FoundationMetricPoint"][];
        };
        ErrorDocument: {
            schema_version: components["schemas"]["SchemaVersion"];
            error: {
                code: string;
                message: string;
            };
        };
    };
    responses: {
        /** @description Typed scope timeseries document */
        TimeseriesResponse: {
            headers: {
                ETag: components["headers"]["ETag"];
                "Cache-Control": components["headers"]["CacheControl"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ScopeTimeseriesDocument"];
            };
        };
        /** @description Latest common-as-of market overview */
        MarketsResponse: {
            headers: {
                ETag: components["headers"]["ETag"];
                "Cache-Control": components["headers"]["CacheControl"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["MarketsDocument"];
            };
        };
        /** @description The supplied If-None-Match validator is current. */
        NotModified: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description Stable analytics error */
        ErrorResponse: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorDocument"];
            };
        };
    };
    parameters: {
        Mint: components["schemas"]["SolanaMint"];
        PairId: components["schemas"]["PairId"];
        /** @description Inclusive RFC3339 instant or UTC day. */
        Start: string;
        /** @description Exclusive RFC3339 instant or UTC day. */
        End: string;
        ScopeResolution: components["schemas"]["ScopeResolution"];
        Status: components["schemas"]["ValueStatus"];
        StatusOptional: components["schemas"]["ValueStatus"];
        /** @description Sorted, comma-separated closed dataset selection. */
        NetworkInclude: string;
        /** @description Sorted, comma-separated closed dataset selection. */
        PairInclude: string;
    };
    requestBodies: never;
    headers: {
        /** @description Deterministic request, epoch, revision, and watermark validator. */
        ETag: string;
        /** @description Revision-aware final or short provisional cache policy. */
        CacheControl: string;
    };
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getMarkets: {
        parameters: {
            query?: {
                status?: components["parameters"]["StatusOptional"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["MarketsResponse"];
            304: components["responses"]["NotModified"];
            default: components["responses"]["ErrorResponse"];
        };
    };
    getNetworkTimeseries: {
        parameters: {
            query: {
                /** @description Inclusive RFC3339 instant or UTC day. */
                start: components["parameters"]["Start"];
                /** @description Exclusive RFC3339 instant or UTC day. */
                end: components["parameters"]["End"];
                resolution: components["parameters"]["ScopeResolution"];
                status: components["parameters"]["Status"];
                /** @description Sorted, comma-separated closed dataset selection. */
                include: components["parameters"]["NetworkInclude"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["TimeseriesResponse"];
            304: components["responses"]["NotModified"];
            default: components["responses"]["ErrorResponse"];
        };
    };
    getTokenTimeseries: {
        parameters: {
            query: {
                /** @description Inclusive RFC3339 instant or UTC day. */
                start: components["parameters"]["Start"];
                /** @description Exclusive RFC3339 instant or UTC day. */
                end: components["parameters"]["End"];
                resolution: components["parameters"]["ScopeResolution"];
                status: components["parameters"]["Status"];
                /** @description Sorted, comma-separated closed dataset selection. */
                include: components["parameters"]["NetworkInclude"];
            };
            header?: never;
            path: {
                mint: components["parameters"]["Mint"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["TimeseriesResponse"];
            304: components["responses"]["NotModified"];
            default: components["responses"]["ErrorResponse"];
        };
    };
    getPairTimeseries: {
        parameters: {
            query: {
                /** @description Inclusive RFC3339 instant or UTC day. */
                start: components["parameters"]["Start"];
                /** @description Exclusive RFC3339 instant or UTC day. */
                end: components["parameters"]["End"];
                resolution: components["parameters"]["ScopeResolution"];
                status: components["parameters"]["Status"];
                /** @description Sorted, comma-separated closed dataset selection. */
                include: components["parameters"]["PairInclude"];
            };
            header?: never;
            path: {
                pair_id: components["parameters"]["PairId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: components["responses"]["TimeseriesResponse"];
            304: components["responses"]["NotModified"];
            default: components["responses"]["ErrorResponse"];
        };
    };
    getAssetPrices: {
        parameters: {
            query: {
                /** @description Inclusive RFC3339 instant or UTC day. */
                start: components["parameters"]["Start"];
                /** @description Exclusive RFC3339 instant or UTC day. */
                end: components["parameters"]["End"];
                resolution: components["schemas"]["PriceResolution"];
                status: components["parameters"]["Status"];
            };
            header?: never;
            path: {
                mint: components["parameters"]["Mint"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Price series */
            200: {
                headers: {
                    ETag: components["headers"]["ETag"];
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PricesDocument"];
                };
            };
            304: components["responses"]["NotModified"];
            default: components["responses"]["ErrorResponse"];
        };
    };
    getMethodology: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Methodology catalog */
            200: {
                headers: {
                    ETag: components["headers"]["ETag"];
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MethodologyDocument"];
                };
            };
            304: components["responses"]["NotModified"];
            default: components["responses"]["ErrorResponse"];
        };
    };
    getFoundationMetrics: {
        parameters: {
            query: {
                metric: components["schemas"]["FoundationMetric"];
                start: components["schemas"]["Day"];
                /** @description Inclusive UTC day, at most 366 returned days. */
                end: components["schemas"]["Day"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Final daily metric points */
            200: {
                headers: {
                    ETag: components["headers"]["ETag"];
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FoundationDocument"];
                };
            };
            304: components["responses"]["NotModified"];
            default: components["responses"]["ErrorResponse"];
        };
    };
}

