use polaris_data_client::grpc::{connect, connect_with_bearer, subscribe_request};
use polaris_data_client::proto::Feed;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let endpoint = std::env::var("POLARIS_DATA_GRPC_URL")?;
    let request = subscribe_request(
        [Feed::Swaps],
        ["SOL-USDC"],
        std::iter::empty::<String>(),
        std::iter::empty::<String>(),
        std::iter::empty::<String>(),
    );
    let api_key = std::env::var("POLARIS_DATA_API_KEY").ok();
    if let Some(api_key) = api_key {
        let mut client = connect_with_bearer(endpoint, api_key).await?;
        let mut stream = client.subscribe(request).await?.into_inner();
        if let Some(event) = stream.message().await? {
            println!("{event:#?}");
        }
        return Ok(());
    }
    let mut client = connect(endpoint).await?;
    let mut stream = client.subscribe(request).await?.into_inner();
    if let Some(event) = stream.message().await? {
        println!("{event:#?}");
    }
    Ok(())
}
