export type AppPhase =
  | "booting"
  | "idle"
  | "acquiring"
  | "ritual"
  | "submitting"
  | "result"
  | "leaderboard"
  | "locked"
  | "error";

export type SignalStatus = "WEAK" | "UNSTABLE" | "STABLE" | "STRONG" | "ASTRONOMICAL";

export type ArchiveSource = "local" | "supabase";

export interface AcquisitionPayload {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  batteryLevel: number | null;
  city: string | null;
  country: string | null;
  capturedAt: string;
  currentHour: number;
}

export interface SubmissionRecord {
  id: string;
  name: string;
  signal: number;
  status: SignalStatus;
  title: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  batteryLevel: number | null;
  city: string | null;
  country: string | null;
  metadata: string[];
  createdAt: string;
  clientId: string;
  fingerprint: string | null;
  source: ArchiveSource;
  rank?: number;
}

export interface PersistedTransmission {
  locked: boolean;
  submission: SubmissionRecord | null;
}

export interface SubmissionResult {
  leaderboard: SubmissionRecord[];
  player: SubmissionRecord;
  source: ArchiveSource;
}

export const ACQUISITION_MESSAGES = [
  "Locating device...",
  "Reading elevation...",
  "Measuring atmospheric noise...",
  "Stabilizing signal...",
  "Transmission window opening...",
] as const;
