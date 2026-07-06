# Contract Versioning

The current public contract is `market_data.v1`.

Within V1, Polaris may add optional fields and new enum values when existing
clients can safely ignore them. Existing field numbers, event names, field
meanings, and required semantics are stable for the life of V1.

A new major contract is required for:

- removing a field;
- changing the meaning or units of a field;
- changing a feed name;
- making an optional field required for correct decoding;
- changing enum semantics;
- changing filter behavior in a way that existing clients cannot safely ignore.

Internal transport and storage implementation details are not public contracts.
Public clients should depend only on the documented WebSocket JSON and gRPC
protobuf contracts.
