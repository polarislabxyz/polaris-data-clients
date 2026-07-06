use polaris_data_client::ws::{read_one_json, WsSubscribe};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let endpoint = std::env::var("PUBLIC_POLARIS_DATA_WS_URL")
        .unwrap_or_else(|_| "wss://public-data.polarislab.xyz/ws/public".to_owned());
    let event = read_one_json(WsSubscribe {
        endpoint,
        feed: "swaps".to_owned(),
        pair: Some("SOL-USDC".to_owned()),
        pool: None,
        source: None,
        profile: None,
        api_key: None,
    })
    .await?;
    println!("{}", serde_json::to_string_pretty(&event)?);
    Ok(())
}
