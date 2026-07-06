pub mod grpc;
pub mod ws;

pub const MARKET_DATA_CONTRACT_VERSION: &str = "market_data.v1";

pub mod proto {
    tonic::include_proto!("polaris.data_gateway.v1");
}
