use futures_util::{SinkExt, StreamExt};
use serde_json::Value;
use tokio_tungstenite::{
    connect_async,
    tungstenite::{client::IntoClientRequest, http::header::AUTHORIZATION, Message},
};
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
    pub fn url(&self) -> Result<String, url::ParseError> {
        let mut url = Url::parse(&self.endpoint)?;
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
                let _ = ws.close(None).await;
                return Ok(value);
            }
            Message::Binary(bytes) => {
                let value = serde_json::from_slice(&bytes)?;
                let _ = ws.close(None).await;
                return Ok(value);
            }
            Message::Ping(bytes) => ws.send(Message::Pong(bytes)).await?,
            Message::Close(_) => break,
            Message::Pong(_) | Message::Frame(_) => {}
        }
    }
    Err("websocket closed before a JSON message arrived".into())
}
