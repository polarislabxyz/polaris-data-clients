use polaris_data_client::ws::{read_one_json, WsSubscribe};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let endpoint = std::env::var("POLARIS_DATA_WS_URL")?;
    let api_key = std::env::var("POLARIS_DATA_API_KEY")?;
    let event = read_one_json(WsSubscribe {
        endpoint,
        feed: "liquidity_book".to_owned(),
        pair: Some("SOL-USDC".to_owned()),
        pool: None,
        source: None,
        profile: Some("dense".to_owned()),
        api_key: Some(api_key),
    })
    .await?;
    println!("{}", serde_json::to_string_pretty(&event)?);
    Ok(())
}
