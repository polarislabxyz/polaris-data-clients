use polaris_data_client::grpc::{connect, subscribe_request};
use polaris_data_client::proto::Feed;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let endpoint = std::env::var("POLARIS_DATA_GRPC_URL")?;
    let mut client = connect(endpoint).await?;
    let request = subscribe_request(
        [Feed::LiquidityBook],
        ["SOL-USDC"],
        std::iter::empty::<String>(),
        std::iter::empty::<String>(),
        ["dense"],
    );
    let mut stream = client.subscribe(request).await?.into_inner();
    if let Some(event) = stream.message().await? {
        println!("{event:#?}");
    }
    Ok(())
}
