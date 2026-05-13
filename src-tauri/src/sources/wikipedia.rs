use anyhow::{anyhow, Result};
use chrono::NaiveDate;
use regex::Regex;
use scraper::{ElementRef, Html, Selector};

use crate::db::{NewPoll, PartyResult};
use crate::parties::Party;

const URL: &str =
    "https://sv.wikipedia.org/wiki/Opinionsm%C3%A4tningar_inf%C3%B6r_riksdagsvalet_i_Sverige_2026";
const USER_AGENT: &str = "val2026/0.1 opinion-tracker";

pub async fn fetch() -> Result<Vec<NewPoll>> {
    let html = fetch_html().await?;
    Ok(parse(&html))
}

async fn fetch_html() -> Result<String> {
    let client = reqwest::Client::builder().user_agent(USER_AGENT).build()?;
    let resp = client.get(URL).send().await?;
    if !resp.status().is_success() {
        return Err(anyhow!("Wikipedia svarade {}", resp.status()));
    }
    Ok(resp.text().await?)
}

fn parse(html: &str) -> Vec<NewPoll> {
    let doc = Html::parse_document(html);
    let headline_sel = Selector::parse(".mw-headline").unwrap();
    let mut current_heading: Option<String> = None;
    let mut polls = Vec::new();

    for node in doc.tree.nodes() {
        let el_ref = match ElementRef::wrap(node) {
            Some(e) => e,
            None => continue,
        };
        match el_ref.value().name() {
            "h2" | "h3" | "h4" => {
                let text = if let Some(headline) = el_ref.select(&headline_sel).next() {
                    clean(&headline.text().collect::<String>())
                } else {
                    clean(&el_ref.text().collect::<String>())
                };
                let text = text
                    .trim_end_matches("[redigera | redigera wikitext]")
                    .trim_end_matches("[redigera]")
                    .trim()
                    .to_string();
                current_heading = Some(text);
            }
            "table" => {
                let classes = el_ref.value().attr("class").unwrap_or("");
                if !classes.contains("wikitable") {
                    continue;
                }
                if let Some(institute) = current_heading.clone() {
                    polls.extend(parse_table(&el_ref, &institute));
                }
            }
            _ => {}
        }
    }
    polls
}

fn parse_table(table: &ElementRef, institute_heading: &str) -> Vec<NewPoll> {
    let row_sel = Selector::parse("tr").unwrap();
    let cell_sel = Selector::parse("th, td").unwrap();

    let rows: Vec<ElementRef> = table.select(&row_sel).collect();
    if rows.len() < 3 {
        return Vec::new();
    }

    // Find the row whose cells are all party codes — defines party order.
    let mut party_order: Vec<Party> = Vec::new();
    for row in &rows {
        let cells: Vec<String> = row
            .select(&cell_sel)
            .map(|c| clean(&c.text().collect::<String>()))
            .collect();
        if cells.is_empty() {
            continue;
        }
        let parsed: Vec<Option<Party>> = cells.iter().map(|t| Party::from_code(t)).collect();
        if parsed.iter().filter(|p| p.is_some()).count() >= 6
            && parsed.iter().all(|p| p.is_some())
        {
            party_order = parsed.into_iter().flatten().collect();
            break;
        }
    }
    if party_order.is_empty() {
        return Vec::new();
    }

    let institute = normalize_institute(institute_heading);
    let mut out = Vec::new();
    let expected_min = 1 + party_order.len();

    for row in &rows {
        let cells: Vec<String> = row
            .select(&cell_sel)
            .map(|c| clean(&c.text().collect::<String>()))
            .collect();
        if cells.len() < expected_min {
            continue;
        }
        // Skip rows that are header rows (no data)
        let has_td = row.select(&Selector::parse("td").unwrap()).next().is_some();
        if !has_td {
            continue;
        }
        let period_cell = &cells[0];
        let (start, end) = match parse_swedish_date_range(period_cell) {
            Some(v) => v,
            None => continue,
        };

        let mut results = Vec::new();
        for (i, party) in party_order.iter().enumerate() {
            if let Some(cell) = cells.get(i + 1) {
                if let Some(pct) = parse_pct(cell) {
                    results.push(PartyResult {
                        party: party.code().to_string(),
                        percent: pct,
                    });
                }
            }
        }
        if results.len() < 4 {
            continue;
        }
        // Skip if institute name suggests this is an aggregator
        if institute.eq_ignore_ascii_case("trend") || institute.is_empty() {
            continue;
        }

        let end_str = end.format("%Y-%m-%d").to_string();
        out.push(NewPoll {
            institute: institute.clone(),
            field_start: start.format("%Y-%m-%d").to_string(),
            field_end: end_str.clone(),
            publication_date: end_str,
            sample_size: None,
            source: "wikipedia".to_string(),
            source_url: Some(URL.to_string()),
            results,
        });
    }
    out
}

fn normalize_institute(s: &str) -> String {
    let s = s.trim();
    // Strip parenthetical aliases like "Verian (f.d. Kantar Sifo)"
    if let Some(idx) = s.find(" (") {
        return s[..idx].to_string();
    }
    s.to_string()
}

fn clean(s: &str) -> String {
    s.replace('\u{a0}', " ")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

fn parse_pct(s: &str) -> Option<f64> {
    let cleaned: String = s
        .chars()
        .filter(|c| c.is_ascii_digit() || *c == ',' || *c == '.')
        .collect();
    if cleaned.is_empty() {
        return None;
    }
    cleaned
        .replace(',', ".")
        .parse::<f64>()
        .ok()
        .filter(|v| *v >= 0.0 && *v <= 100.0)
}

fn swedish_month(s: &str) -> Option<u32> {
    match s.to_lowercase().as_str() {
        "januari" | "jan" => Some(1),
        "februari" | "feb" => Some(2),
        "mars" | "mar" => Some(3),
        "april" | "apr" => Some(4),
        "maj" => Some(5),
        "juni" | "jun" => Some(6),
        "juli" | "jul" => Some(7),
        "augusti" | "aug" => Some(8),
        "september" | "sep" | "sept" => Some(9),
        "oktober" | "okt" => Some(10),
        "november" | "nov" => Some(11),
        "december" | "dec" => Some(12),
        _ => None,
    }
}

fn parse_swedish_date_range(s: &str) -> Option<(NaiveDate, NaiveDate)> {
    let normalized = s.replace('–', "-").replace('—', "-");
    let normalized = normalized.trim();

    // "27 april-10 maj 2026"
    let re_full = Regex::new(r"^(\d{1,2})\s+(\p{L}+)\s*-\s*(\d{1,2})\s+(\p{L}+)\s+(\d{4})").ok()?;
    if let Some(c) = re_full.captures(normalized) {
        let d1: u32 = c[1].parse().ok()?;
        let m1 = swedish_month(&c[2])?;
        let d2: u32 = c[3].parse().ok()?;
        let m2 = swedish_month(&c[4])?;
        let y: i32 = c[5].parse().ok()?;
        // If start month is later in year than end month, start is in previous year
        let start_year = if m1 > m2 { y - 1 } else { y };
        return Some((
            NaiveDate::from_ymd_opt(start_year, m1, d1)?,
            NaiveDate::from_ymd_opt(y, m2, d2)?,
        ));
    }

    // "6-19 april 2026"
    let re_same = Regex::new(r"^(\d{1,2})\s*-\s*(\d{1,2})\s+(\p{L}+)\s+(\d{4})").ok()?;
    if let Some(c) = re_same.captures(normalized) {
        let d1: u32 = c[1].parse().ok()?;
        let d2: u32 = c[2].parse().ok()?;
        let m = swedish_month(&c[3])?;
        let y: i32 = c[4].parse().ok()?;
        return Some((
            NaiveDate::from_ymd_opt(y, m, d1)?,
            NaiveDate::from_ymd_opt(y, m, d2)?,
        ));
    }

    // "27 april 2026"
    let re_one = Regex::new(r"^(\d{1,2})\s+(\p{L}+)\s+(\d{4})").ok()?;
    if let Some(c) = re_one.captures(normalized) {
        let d: u32 = c[1].parse().ok()?;
        let m = swedish_month(&c[2])?;
        let y: i32 = c[3].parse().ok()?;
        let date = NaiveDate::from_ymd_opt(y, m, d)?;
        return Some((date, date));
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_saved_wikipedia_html() {
        let path = "/tmp/wiki_2026.html";
        if !std::path::Path::new(path).exists() {
            eprintln!("skip: {path} not present");
            return;
        }
        let html = std::fs::read_to_string(path).expect("read html");
        let polls = parse(&html);
        eprintln!("parsed {} polls", polls.len());
        if let Some(p) = polls.first() {
            eprintln!("first: {} {} -> {}", p.institute, p.field_end, p.results.len());
            for r in &p.results {
                eprintln!("  {}: {}", r.party, r.percent);
            }
        }
        let institutes: std::collections::HashSet<_> =
            polls.iter().map(|p| p.institute.clone()).collect();
        eprintln!("institutes: {:?}", institutes);
        assert!(polls.len() > 100, "expected >100 polls, got {}", polls.len());
        assert!(institutes.contains("Verian"));
        assert!(institutes.contains("Novus"));
    }

    #[test]
    fn parses_dates() {
        assert_eq!(
            parse_swedish_date_range("27 april–10 maj 2026"),
            Some((
                NaiveDate::from_ymd_opt(2026, 4, 27).unwrap(),
                NaiveDate::from_ymd_opt(2026, 5, 10).unwrap()
            ))
        );
        assert_eq!(
            parse_swedish_date_range("6-19 april 2026"),
            Some((
                NaiveDate::from_ymd_opt(2026, 4, 6).unwrap(),
                NaiveDate::from_ymd_opt(2026, 4, 19).unwrap()
            ))
        );
        assert_eq!(
            parse_swedish_date_range("27 april 2026"),
            Some((
                NaiveDate::from_ymd_opt(2026, 4, 27).unwrap(),
                NaiveDate::from_ymd_opt(2026, 4, 27).unwrap()
            ))
        );
    }
}
