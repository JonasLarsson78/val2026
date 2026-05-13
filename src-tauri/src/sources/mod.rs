pub mod wikipedia;

use crate::db::NewPoll;
use anyhow::Result;

pub async fn fetch_all() -> Vec<FetchOutcome> {
    vec![run("wikipedia", wikipedia::fetch()).await]
}

async fn run<F>(name: &str, fut: F) -> FetchOutcome
where
    F: std::future::Future<Output = Result<Vec<NewPoll>>>,
{
    match fut.await {
        Ok(polls) => FetchOutcome {
            source: name.to_string(),
            polls,
            error: None,
        },
        Err(e) => FetchOutcome {
            source: name.to_string(),
            polls: Vec::new(),
            error: Some(e.to_string()),
        },
    }
}

#[derive(Debug)]
pub struct FetchOutcome {
    pub source: String,
    pub polls: Vec<NewPoll>,
    pub error: Option<String>,
}
