use anyhow::Result;
use chrono::NaiveDate;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

use crate::parties::Party;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Poll {
    pub id: i64,
    pub institute: String,
    pub field_start: String,
    pub field_end: String,
    pub publication_date: String,
    pub sample_size: Option<i64>,
    pub source: String,
    pub source_url: Option<String>,
    pub results: Vec<PartyResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartyResult {
    pub party: String,
    pub percent: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewPoll {
    pub institute: String,
    pub field_start: String,
    pub field_end: String,
    pub publication_date: String,
    pub sample_size: Option<i64>,
    pub source: String,
    pub source_url: Option<String>,
    pub results: Vec<PartyResult>,
}

pub struct Db {
    conn: Mutex<Connection>,
}

impl Db {
    pub fn open(path: PathBuf) -> Result<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let conn = Connection::open(path)?;
        conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS polls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                institute TEXT NOT NULL,
                field_start TEXT NOT NULL,
                field_end TEXT NOT NULL,
                publication_date TEXT NOT NULL,
                sample_size INTEGER,
                source TEXT NOT NULL,
                source_url TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                UNIQUE(institute, field_end, source)
            );
            CREATE TABLE IF NOT EXISTS poll_results (
                poll_id INTEGER NOT NULL,
                party TEXT NOT NULL,
                percent REAL NOT NULL,
                PRIMARY KEY (poll_id, party),
                FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_polls_field_end ON polls(field_end);
            "#,
        )?;
        Ok(Db {
            conn: Mutex::new(conn),
        })
    }

    pub fn upsert_poll(&self, p: &NewPoll) -> Result<i64> {
        let mut conn = self.conn.lock().unwrap();
        let tx = conn.transaction()?;
        tx.execute(
            "INSERT INTO polls (institute, field_start, field_end, publication_date, sample_size, source, source_url)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
             ON CONFLICT(institute, field_end, source) DO UPDATE SET
                field_start = excluded.field_start,
                publication_date = excluded.publication_date,
                sample_size = excluded.sample_size,
                source_url = excluded.source_url",
            params![
                p.institute,
                p.field_start,
                p.field_end,
                p.publication_date,
                p.sample_size,
                p.source,
                p.source_url
            ],
        )?;
        let id: i64 = tx.query_row(
            "SELECT id FROM polls WHERE institute = ?1 AND field_end = ?2 AND source = ?3",
            params![p.institute, p.field_end, p.source],
            |row| row.get(0),
        )?;
        tx.execute("DELETE FROM poll_results WHERE poll_id = ?1", params![id])?;
        {
            let mut stmt = tx.prepare(
                "INSERT INTO poll_results (poll_id, party, percent) VALUES (?1, ?2, ?3)",
            )?;
            for r in &p.results {
                if Party::from_code(&r.party).is_none() {
                    continue;
                }
                stmt.execute(params![id, r.party.to_uppercase(), r.percent])?;
            }
        }
        tx.commit()?;
        Ok(id)
    }

    pub fn list_polls(&self) -> Result<Vec<Poll>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, institute, field_start, field_end, publication_date, sample_size, source, source_url
             FROM polls ORDER BY field_end DESC",
        )?;
        let rows = stmt
            .query_map([], |row| {
                Ok(Poll {
                    id: row.get(0)?,
                    institute: row.get(1)?,
                    field_start: row.get(2)?,
                    field_end: row.get(3)?,
                    publication_date: row.get(4)?,
                    sample_size: row.get(5)?,
                    source: row.get(6)?,
                    source_url: row.get(7)?,
                    results: vec![],
                })
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;

        let mut polls = rows;
        let mut res_stmt = conn
            .prepare("SELECT party, percent FROM poll_results WHERE poll_id = ?1")?;
        for poll in polls.iter_mut() {
            let results: Vec<PartyResult> = res_stmt
                .query_map(params![poll.id], |row| {
                    Ok(PartyResult {
                        party: row.get(0)?,
                        percent: row.get(1)?,
                    })
                })?
                .collect::<rusqlite::Result<Vec<_>>>()?;
            poll.results = results;
        }
        Ok(polls)
    }

    pub fn count(&self) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        let n: i64 = conn.query_row("SELECT COUNT(*) FROM polls", [], |r| r.get(0))?;
        Ok(n)
    }

    pub fn delete_poll(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM polls WHERE id = ?1", params![id])?;
        Ok(())
    }
}

#[allow(dead_code)]
pub fn parse_date(s: &str) -> Option<NaiveDate> {
    NaiveDate::parse_from_str(s, "%Y-%m-%d").ok()
}
