import type { components } from "../generated/analytics-v2.js";

export type AnalyticsSchema = components["schemas"];
export type MarketsDocument = AnalyticsSchema["MarketsDocument"];
export type ScopeTimeseriesDocument = AnalyticsSchema["ScopeTimeseriesDocument"];
export type PricesDocument = AnalyticsSchema["PricesDocument"];
export type MethodologyDocument = AnalyticsSchema["MethodologyDocument"];
export type FoundationDocument = AnalyticsSchema["FoundationDocument"];
export type ActivityDataset = AnalyticsSchema["ActivityDataset"];
export type VolumeCompositionSeries = AnalyticsSchema["VolumeCompositionSeries"];
export type VenueVolumeSeries = AnalyticsSchema["VenueVolumeSeries"];
export type RoutedLiquidityDataset = AnalyticsSchema["RoutedLiquidityDataset"];
export type AnalyticsDataset = AnalyticsSchema["Dataset"];
export type AnalyticsStatus = AnalyticsSchema["ValueStatus"];
export type ScopeResolution = AnalyticsSchema["ScopeResolution"];
export type PriceResolution = AnalyticsSchema["PriceResolution"];
export type FoundationMetric = AnalyticsSchema["FoundationMetric"];

export interface TimeseriesQuery {
  start: string;
  end: string;
  resolution: ScopeResolution;
  status: AnalyticsStatus;
  include: readonly AnalyticsDataset[];
}

export interface PriceQuery {
  start: string;
  end: string;
  resolution: PriceResolution;
  status: AnalyticsStatus;
}

export interface FoundationQuery {
  metric: FoundationMetric;
  start: string;
  end: string;
}
