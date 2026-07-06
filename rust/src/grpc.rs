use crate::proto::polaris_data_gateway_client::PolarisDataGatewayClient;
use crate::proto::{Feed, SubscribeRequest};
use tonic::transport::{Channel, Endpoint};

pub async fn connect(
    endpoint: impl AsRef<str>,
) -> Result<PolarisDataGatewayClient<Channel>, tonic::transport::Error> {
    let channel = Endpoint::from_shared(endpoint.as_ref().to_owned())?
        .connect()
        .await?;
    Ok(PolarisDataGatewayClient::new(channel))
}

pub fn subscribe_request(
    feeds: impl IntoIterator<Item = Feed>,
    pairs: impl IntoIterator<Item = impl Into<String>>,
    pools: impl IntoIterator<Item = impl Into<String>>,
    sources: impl IntoIterator<Item = impl Into<String>>,
    profiles: impl IntoIterator<Item = impl Into<String>>,
) -> SubscribeRequest {
    SubscribeRequest {
        feeds: feeds.into_iter().map(|feed| feed as i32).collect(),
        pairs: pairs.into_iter().map(Into::into).collect(),
        pools: pools.into_iter().map(Into::into).collect(),
        sources: sources.into_iter().map(Into::into).collect(),
        profiles: profiles.into_iter().map(Into::into).collect(),
    }
}
