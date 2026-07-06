use crate::proto::polaris_data_gateway_client::PolarisDataGatewayClient;
use crate::proto::{Feed, SubscribeRequest};
use tonic::codegen::InterceptedService;
use tonic::metadata::{Ascii, MetadataValue};
use tonic::service::Interceptor;
use tonic::transport::{Channel, Endpoint};
use tonic::{Request, Status};

pub async fn connect(
    endpoint: impl AsRef<str>,
) -> Result<PolarisDataGatewayClient<Channel>, tonic::transport::Error> {
    let channel = Endpoint::from_shared(endpoint.as_ref().to_owned())?
        .connect()
        .await?;
    Ok(PolarisDataGatewayClient::new(channel))
}

#[derive(Clone)]
pub struct BearerAuth {
    value: MetadataValue<Ascii>,
}

impl BearerAuth {
    pub fn new(api_key: impl AsRef<str>) -> Result<Self, tonic::metadata::errors::InvalidMetadataValue> {
        Ok(Self {
            value: format!("Bearer {}", api_key.as_ref()).parse()?,
        })
    }
}

impl Interceptor for BearerAuth {
    fn call(&mut self, mut request: Request<()>) -> Result<Request<()>, Status> {
        request
            .metadata_mut()
            .insert("authorization", self.value.clone());
        Ok(request)
    }
}

pub async fn connect_with_bearer(
    endpoint: impl AsRef<str>,
    api_key: impl AsRef<str>,
) -> Result<
    PolarisDataGatewayClient<InterceptedService<Channel, BearerAuth>>,
    Box<dyn std::error::Error + Send + Sync>,
> {
    let channel = Endpoint::from_shared(endpoint.as_ref().to_owned())?
        .connect()
        .await?;
    Ok(PolarisDataGatewayClient::with_interceptor(
        channel,
        BearerAuth::new(api_key)?,
    ))
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
