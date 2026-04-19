import type { PersistedTransmission, SubmissionRecord } from "./types";

const CALLSIGN_KEY = "onebar_callsign";
const CLIENT_ID_KEY = "onebar_client_id";
const LOCAL_LEADERBOARD_KEY = "onebar_local_leaderboard";
const SUBMISSION_SNAPSHOT_KEY = "onebar_submission_snapshot";
const TRANSMITTED_KEY = "onebar_has_transmitted";

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getOrCreateClientId(): string {
  const existing = window.localStorage.getItem(CLIENT_ID_KEY);

  if (existing) {
    return existing;
  }

  const nextValue = crypto.randomUUID();
  window.localStorage.setItem(CLIENT_ID_KEY, nextValue);
  return nextValue;
}

export function loadSavedTransmission(): PersistedTransmission {
  return {
    locked: window.localStorage.getItem(TRANSMITTED_KEY) === "true",
    submission: readJson<SubmissionRecord>(SUBMISSION_SNAPSHOT_KEY),
  };
}

export function saveSuccessfulTransmission(record: SubmissionRecord): void {
  window.localStorage.setItem(TRANSMITTED_KEY, "true");
  writeJson(SUBMISSION_SNAPSHOT_KEY, record);
}

export function rememberCallsign(name: string): void {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return;
  }

  window.localStorage.setItem(CALLSIGN_KEY, trimmed);
}

export function loadRememberedCallsign(): string {
  return window.localStorage.getItem(CALLSIGN_KEY) ?? "";
}

export function loadLocalLeaderboard(): SubmissionRecord[] | null {
  return readJson<SubmissionRecord[]>(LOCAL_LEADERBOARD_KEY);
}

export function saveLocalLeaderboard(records: SubmissionRecord[]): void {
  writeJson(LOCAL_LEADERBOARD_KEY, records);
}
