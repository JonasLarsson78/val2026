mod db;
mod parties;
mod sources;

use db::{Db, NewPoll, PartyResult, Poll};
use serde::Serialize;
use std::sync::Arc;
use tauri::Manager;

struct AppState {
    db: Arc<Db>,
}

#[derive(Serialize)]
struct RefreshReport {
    total_inserted: usize,
    per_source: Vec<SourceReport>,
}

#[derive(Serialize)]
struct SourceReport {
    source: String,
    fetched: usize,
    error: Option<String>,
}

#[tauri::command]
fn list_polls(state: tauri::State<AppState>) -> Result<Vec<Poll>, String> {
    state.db.list_polls().map_err(|e| e.to_string())
}

#[tauri::command]
fn poll_count(state: tauri::State<AppState>) -> Result<i64, String> {
    state.db.count().map_err(|e| e.to_string())
}

#[tauri::command]
async fn refresh_polls(state: tauri::State<'_, AppState>) -> Result<RefreshReport, String> {
    let outcomes = sources::fetch_all().await;
    let mut total_inserted = 0usize;
    let mut per_source = Vec::new();
    for outcome in outcomes {
        let mut inserted = 0usize;
        for poll in &outcome.polls {
            if state.db.upsert_poll(poll).is_ok() {
                inserted += 1;
            }
        }
        total_inserted += inserted;
        per_source.push(SourceReport {
            source: outcome.source,
            fetched: inserted,
            error: outcome.error,
        });
    }
    Ok(RefreshReport {
        total_inserted,
        per_source,
    })
}

#[tauri::command]
fn add_manual_poll(state: tauri::State<AppState>, poll: NewPoll) -> Result<i64, String> {
    let mut p = poll;
    if p.source.is_empty() {
        p.source = "manuell".to_string();
    }
    state.db.upsert_poll(&p).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_poll(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    state.db.delete_poll(id).map_err(|e| e.to_string())
}

#[allow(dead_code)]
fn _ensure_types(_: PartyResult) {}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            let db = Db::open(dir.join("polls.sqlite")).expect("failed to open db");
            app.manage(AppState { db: Arc::new(db) });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_polls,
            poll_count,
            refresh_polls,
            add_manual_poll,
            delete_poll,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
