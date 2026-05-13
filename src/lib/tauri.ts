import { invoke } from "@tauri-apps/api/core";
import type { PartyCode } from "./parties";

export interface PartyResult {
  party: PartyCode;
  percent: number;
}

export interface Poll {
  id: number;
  institute: string;
  field_start: string;
  field_end: string;
  publication_date: string;
  sample_size: number | null;
  source: string;
  source_url: string | null;
  results: PartyResult[];
}

export interface SourceReport {
  source: string;
  fetched: number;
  error: string | null;
}

export interface RefreshReport {
  total_inserted: number;
  per_source: SourceReport[];
}

export const api = {
  listPolls: () => invoke<Poll[]>("list_polls"),
  pollCount: () => invoke<number>("poll_count"),
  refresh: () => invoke<RefreshReport>("refresh_polls"),
  deletePoll: (id: number) => invoke<void>("delete_poll", { id }),
};
