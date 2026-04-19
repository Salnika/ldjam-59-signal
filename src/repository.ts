import { getSignalStatus, getSignalTitle } from "./game";
import { loadLocalLeaderboard, saveLocalLeaderboard } from "./storage";
import { hasSupabaseConfig, supabase } from "./supabase";
import type { ArchiveSource, SubmissionRecord, SubmissionResult } from "./types";

interface SubmissionRow {
  accuracy: number | null;
  altitude: number | null;
  battery_level: number | null;
  city: string | null;
  client_id: string;
  country: string | null;
  created_at: string;
  fingerprint: string | null;
  id: string;
  latitude: number | null;
  longitude: number | null;
  metadata: unknown;
  name: string;
  signal: number;
  status: string;
  title: string;
}

const SEEDED_TRANSMISSIONS: SubmissionRecord[] = [
  {
    id: "seed-1",
    name: "RIDGELINE-9",
    signal: 4910,
    status: getSignalStatus(4910),
    title: getSignalTitle(4910),
    latitude: null,
    longitude: null,
    altitude: 438,
    accuracy: 11,
    batteryLevel: 0.61,
    city: "La Paz",
    country: "BO",
    metadata: ["High altitude transmission", "Precise lock acquired"],
    createdAt: "2026-04-17T23:14:02.000Z",
    clientId: "seed-client-1",
    fingerprint: "seed-client-1",
    source: "local",
  },
  {
    id: "seed-2",
    name: "CIRRUS",
    signal: 3442,
    status: getSignalStatus(3442),
    title: getSignalTitle(3442),
    latitude: null,
    longitude: null,
    altitude: 318,
    accuracy: 24,
    batteryLevel: 0.48,
    city: "Quito",
    country: "EC",
    metadata: ["Regional lock confirmed"],
    createdAt: "2026-04-17T22:08:31.000Z",
    clientId: "seed-client-2",
    fingerprint: "seed-client-2",
    source: "local",
  },
  {
    id: "seed-3",
    name: "WIDEBAND",
    signal: 2864,
    status: getSignalStatus(2864),
    title: getSignalTitle(2864),
    latitude: null,
    longitude: null,
    altitude: 241,
    accuracy: 33,
    batteryLevel: 0.16,
    city: "Grenoble",
    country: "FR",
    metadata: ["Critical power state", "Stable atmospheric reading"],
    createdAt: "2026-04-17T21:50:19.000Z",
    clientId: "seed-client-3",
    fingerprint: "seed-client-3",
    source: "local",
  },
  {
    id: "seed-4",
    name: "FIELDHOST",
    signal: 2087,
    status: getSignalStatus(2087),
    title: getSignalTitle(2087),
    latitude: null,
    longitude: null,
    altitude: 166,
    accuracy: 27,
    batteryLevel: 0.42,
    city: "Kathmandu",
    country: "NP",
    metadata: ["High altitude transmission"],
    createdAt: "2026-04-17T20:41:58.000Z",
    clientId: "seed-client-4",
    fingerprint: "seed-client-4",
    source: "local",
  },
  {
    id: "seed-5",
    name: "NIGHT-PORT",
    signal: 1477,
    status: getSignalStatus(1477),
    title: getSignalTitle(1477),
    latitude: null,
    longitude: null,
    altitude: 126,
    accuracy: 37,
    batteryLevel: 0.75,
    city: "Reykjavik",
    country: "IS",
    metadata: ["Night carrier"],
    createdAt: "2026-04-17T03:02:00.000Z",
    clientId: "seed-client-5",
    fingerprint: "seed-client-5",
    source: "local",
  },
  {
    id: "seed-6",
    name: "LOW CLOUD",
    signal: 1118,
    status: getSignalStatus(1118),
    title: getSignalTitle(1118),
    latitude: null,
    longitude: null,
    altitude: 94,
    accuracy: 44,
    batteryLevel: 0.34,
    city: "Glasgow",
    country: "GB",
    metadata: ["Regional lock confirmed"],
    createdAt: "2026-04-17T18:26:48.000Z",
    clientId: "seed-client-6",
    fingerprint: "seed-client-6",
    source: "local",
  },
];

export class DuplicateTransmissionError extends Error {
  constructor(message = "Record already exists for this device") {
    super(message);
    this.name = "DuplicateTransmissionError";
  }
}

function rankSubmissions(records: SubmissionRecord[], source: ArchiveSource): SubmissionRecord[] {
  return [...records]
    .sort(
      (left, right) =>
        right.signal - left.signal ||
        left.createdAt.localeCompare(right.createdAt) ||
        left.id.localeCompare(right.id),
    )
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      source,
    }));
}

function getLocalArchive(): SubmissionRecord[] {
  const localArchive = loadLocalLeaderboard();

  if (localArchive && localArchive.length > 0) {
    return rankSubmissions(localArchive, "local");
  }

  saveLocalLeaderboard(SEEDED_TRANSMISSIONS);
  return rankSubmissions(SEEDED_TRANSMISSIONS, "local");
}

function normalizeRow(row: SubmissionRow): SubmissionRecord {
  const metadata = Array.isArray(row.metadata)
    ? row.metadata.filter((value): value is string => typeof value === "string")
    : [];

  return {
    id: row.id,
    name: row.name,
    signal: row.signal,
    status: row.status as SubmissionRecord["status"],
    title: row.title,
    latitude: row.latitude,
    longitude: row.longitude,
    altitude: row.altitude,
    accuracy: row.accuracy,
    batteryLevel: row.battery_level,
    city: row.city,
    country: row.country,
    metadata,
    createdAt: row.created_at,
    clientId: row.client_id,
    fingerprint: row.fingerprint,
    source: "supabase",
  };
}

async function getSupabaseLeaderboard(limit: number): Promise<SubmissionRecord[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, name, signal, status, title, latitude, longitude, altitude, accuracy, battery_level, city, country, fingerprint, client_id, metadata, created_at",
    )
    .order("signal", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    throw error ?? new Error("Supabase leaderboard unavailable");
  }

  return rankSubmissions(
    data.map((row) => normalizeRow(row as SubmissionRow)),
    "supabase",
  );
}

async function getSupabaseRank(player: SubmissionRecord): Promise<number> {
  if (!supabase) {
    return 1;
  }

  const { count: higherCount, error: higherError } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .gt("signal", player.signal);

  if (higherError) {
    throw higherError;
  }

  const { count: sameSignalEarlierCount, error: sameSignalError } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("signal", player.signal)
    .lt("created_at", player.createdAt);

  if (sameSignalError) {
    throw sameSignalError;
  }

  return (higherCount ?? 0) + (sameSignalEarlierCount ?? 0) + 1;
}

export async function listLeaderboard(
  limit = 10,
): Promise<{ entries: SubmissionRecord[]; source: ArchiveSource }> {
  if (hasSupabaseConfig && supabase) {
    try {
      const entries = await getSupabaseLeaderboard(limit);
      return { entries, source: "supabase" };
    } catch {
      return {
        entries: getLocalArchive().slice(0, limit),
        source: "local",
      };
    }
  }

  return {
    entries: getLocalArchive().slice(0, limit),
    source: "local",
  };
}

function saveLocalSubmission(player: SubmissionRecord): SubmissionResult {
  const archive = getLocalArchive();

  if (archive.some((entry) => entry.clientId === player.clientId)) {
    throw new DuplicateTransmissionError();
  }

  const nextArchive = rankSubmissions([...archive, player], "local");
  saveLocalLeaderboard(nextArchive);

  const nextPlayer = nextArchive.find((entry) => entry.id === player.id) ?? player;

  return {
    leaderboard: nextArchive.slice(0, 10),
    player: nextPlayer,
    source: "local",
  };
}

export async function submitSubmission(player: SubmissionRecord): Promise<SubmissionResult> {
  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        id: player.id,
        name: player.name,
        signal: player.signal,
        status: player.status,
        title: player.title,
        latitude: player.latitude,
        longitude: player.longitude,
        altitude: player.altitude,
        accuracy: player.accuracy,
        battery_level: player.batteryLevel,
        city: player.city,
        country: player.country,
        fingerprint: player.fingerprint,
        client_id: player.clientId,
        metadata: player.metadata,
        created_at: player.createdAt,
      })
      .select(
        "id, name, signal, status, title, latitude, longitude, altitude, accuracy, battery_level, city, country, fingerprint, client_id, metadata, created_at",
      )
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new DuplicateTransmissionError();
      }

      return saveLocalSubmission(player);
    }

    const savedPlayer = normalizeRow(data as SubmissionRow);
    const [rank, leaderboard] = await Promise.all([
      getSupabaseRank(savedPlayer).catch(() => undefined),
      getSupabaseLeaderboard(10).catch(() => [{ ...savedPlayer, rank: 1 }]),
    ]);

    return {
      leaderboard,
      player: { ...savedPlayer, rank, source: "supabase" },
      source: "supabase",
    };
  }

  return saveLocalSubmission(player);
}
