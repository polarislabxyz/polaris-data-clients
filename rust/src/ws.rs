use futures_util::{SinkExt, StreamExt};
use serde_json::Value;
use tokio_tungstenite::{
    connect_async,
    tungstenite::{client::IntoClientRequest, http::header::AUTHORIZATION, Message},
};
use std::error::Error;
use url::Url;

#[derive(Debug, Clone)]
pub struct WsSubscribe {
    pub endpoint: String,
    pub feed: String,
    pub pair: Option<String>,
    pub pool: Option<String>,
    pub source: Option<String>,
    pub profile: Option<String>,
    pub api_key: Option<String>,
}

impl WsSubscribe {
    pub fn url(&self) -> Result<String, Box<dyn Error>> {
        let mut url = Url::parse(&self.endpoint)?;
        if url.scheme() != "ws" && url.scheme() != "wss" {
            return Err("websocket endpoint must use ws:// or wss://".into());
        }
        if self.api_key.is_some() && url.scheme() != "wss" {
            return Err("authenticated websocket streams require wss://".into());
        }
        if url.username() != "" || url.password().is_some() {
            return Err("websocket endpoint must not include credentials".into());
        }
        if url.query().is_some() {
            return Err("websocket endpoint must not include query parameters".into());
        }
        url.query_pairs_mut().append_pair("feed", &self.feed);
        if let Some(pair) = &self.pair {
            url.query_pairs_mut().append_pair("pair", pair);
        }
        if let Some(pool) = &self.pool {
            url.query_pairs_mut().append_pair("pool", pool);
        }
        if let Some(source) = &self.source {
            url.query_pairs_mut().append_pair("source", source);
        }
        if let Some(profile) = &self.profile {
            url.query_pairs_mut().append_pair("profile", profile);
        }
        Ok(url.to_string())
    }
}

pub async fn read_one_json(subscribe: WsSubscribe) -> Result<Value, Box<dyn std::error::Error>> {
    let requested_feed = subscribe.feed.clone();
    let mut request = subscribe.url()?.into_client_request()?;
    if let Some(api_key) = &subscribe.api_key {
        request.headers_mut().insert(
            AUTHORIZATION,
            format!("Bearer {api_key}").parse()?,
        );
    }
    let (mut ws, _) = connect_async(request).await?;
    while let Some(message) = ws.next().await {
        match message? {
            Message::Text(text) => {
                let value = serde_json::from_str(&text)?;
                if is_requested_data_message(&value, &requested_feed)? {
                    let _ = ws.close(None).await;
                    return Ok(value);
                }
            }
            Message::Binary(bytes) => {
                let value = serde_json::from_slice(&bytes)?;
                if is_requested_data_message(&value, &requested_feed)? {
                    let _ = ws.close(None).await;
                    return Ok(value);
                }
            }
            Message::Ping(bytes) => ws.send(Message::Pong(bytes)).await?,
            Message::Close(_) => break,
            Message::Pong(_) | Message::Frame(_) => {}
        }
    }
    Err("websocket closed before a JSON message arrived".into())
}

fn is_requested_data_message(value: &Value, feed: &str) -> Result<bool, Box<dyn Error>> {
    let Some(message_type) = value.get("type").and_then(Value::as_str) else {
        return Ok(false);
    };
    if message_type == "error" {
        let error = value
            .get("error")
            .and_then(Value::as_str)
            .unwrap_or("gateway returned an error");
        return Err(error.to_owned().into());
    }
    let wanted = match feed {
        "swaps" => message_type == "swap",
        "liquidity_book" => {
            message_type == "liquidity_book" || message_type == "liquidity_book_snapshot"
        }
        "quote_surface" => {
            message_type == "quote_surface" || message_type == "quote_surface_snapshot"
        }
        "depth" => message_type == "depth" || message_type == "depth_snapshot",
        _ => message_type != "hello" && message_type != "subscribed" && message_type != "pong",
    };
    Ok(wanted)
}
