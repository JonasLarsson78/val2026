use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

const REPO: &str = "JonasLarsson78/val2026";
const USER_AGENT: &str = "val2026-update-check";

#[derive(Debug, Serialize)]
pub struct UpdateInfo {
    pub current: String,
    pub latest: String,
    pub update_available: bool,
    pub release_url: String,
    pub published_at: String,
}

#[derive(Deserialize)]
struct GhRelease {
    tag_name: String,
    html_url: String,
    published_at: String,
}

pub async fn check() -> Result<UpdateInfo> {
    let current = env!("CARGO_PKG_VERSION").to_string();
    let url = format!("https://api.github.com/repos/{REPO}/releases/latest");
    let client = reqwest::Client::builder().user_agent(USER_AGENT).build()?;
    let resp = client
        .get(&url)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await?;
    if resp.status() == reqwest::StatusCode::NOT_FOUND {
        return Ok(UpdateInfo {
            current: current.clone(),
            latest: current,
            update_available: false,
            release_url: format!("https://github.com/{REPO}/releases"),
            published_at: String::new(),
        });
    }
    if !resp.status().is_success() {
        return Err(anyhow!("GitHub svarade {}", resp.status()));
    }
    let release: GhRelease = resp.json().await?;
    let latest = release.tag_name.trim_start_matches('v').to_string();
    let update_available = version_greater(&latest, &current);
    Ok(UpdateInfo {
        current,
        latest,
        update_available,
        release_url: release.html_url,
        published_at: release.published_at,
    })
}

fn version_greater(a: &str, b: &str) -> bool {
    parse(a) > parse(b)
}

fn parse(s: &str) -> (u32, u32, u32) {
    let parts: Vec<u32> = s
        .trim_start_matches('v')
        .split('.')
        .take(3)
        .map(|p| {
            p.chars()
                .take_while(|c| c.is_ascii_digit())
                .collect::<String>()
                .parse()
                .unwrap_or(0)
        })
        .collect();
    (
        parts.first().copied().unwrap_or(0),
        parts.get(1).copied().unwrap_or(0),
        parts.get(2).copied().unwrap_or(0),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_comparison() {
        assert!(version_greater("1.2.0", "1.1.9"));
        assert!(version_greater("2.0.0", "1.99.99"));
        assert!(version_greater("1.0.1", "1.0.0"));
        assert!(!version_greater("1.0.0", "1.0.0"));
        assert!(!version_greater("0.9.0", "1.0.0"));
        assert!(version_greater("v1.2.0", "1.1.0"));
    }
}
