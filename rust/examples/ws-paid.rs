use polaris_data_client::ws::{read_one_json, WsSubscribe};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let endpoint = std::env::var("POLARIS_DATA_WS_URL")?;
    let api_key = std::env::var("POLARIS_DATA_API_KEY")?;
    let feed = std::env::var("POLARIS_DATA_FEED").unwrap_or_else(|_| "swaps".to_owned());
    let event = read_one_json(WsSubscribe {
        endpoint,
        feed,
        pair: std::env::var("POLARIS_DATA_PAIR").ok(),
        pool: std::env::var("POLARIS_DATA_POOL").ok(),
        source: std::env::var("POLARIS_DATA_SOURCE").ok(),
        profile: std::env::var("POLARIS_DATA_PROFILE").ok(),
        api_key: Some(api_key),
    })
    .await?;
    println!("{}", serde_json::to_string_pretty(&event)?);
    Ok(())
}
