export class AnalyticsClientError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AnalyticsClientError";
  }
}

export class AnalyticsHttpError extends AnalyticsClientError {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AnalyticsHttpError";
  }
}

export class AnalyticsContractError extends AnalyticsClientError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AnalyticsContractError";
  }
}
