import type { AcquisitionPayload, ArchiveSource, SignalStatus, SubmissionRecord } from "./types";

const FALLBACK_ALTITUDE = 50;
const LOW_BATTERY_THRESHOLD = 0.2;

export function computeSignal(payload: AcquisitionPayload, randomSeed = Math.random()): number {
  const baseAltitude = payload.altitude ?? FALLBACK_ALTITUDE;
  const altitudeScore = baseAltitude * 10;

  const accuracyBonus = payload.accuracy != null ? Math.max(0, 100 - payload.accuracy) * 2 : 0;

  const batteryBonus =
    payload.batteryLevel != null && payload.batteryLevel < LOW_BATTERY_THRESHOLD ? 50 : 0;

  const timeBonus = payload.currentHour >= 0 && payload.currentHour <= 5 ? 30 : 0;

  const randomness = Math.floor(randomSeed * 50);

  return Math.round(altitudeScore + accuracyBonus + batteryBonus + timeBonus + randomness);
}

export function getSignalStatus(signal: number): SignalStatus {
  if (signal < 500) {
    return "WEAK";
  }

  if (signal < 1500) {
    return "UNSTABLE";
  }

  if (signal < 3000) {
    return "STABLE";
  }

  if (signal < 6000) {
    return "STRONG";
  }

  return "ASTRONOMICAL";
}

export function getSignalTitle(signal: number): string {
  if (signal < 500) {
    return "Basement Ghost";
  }

  if (signal < 1500) {
    return "Street Receiver";
  }

  if (signal < 3000) {
    return "Rooftop Caller";
  }

  if (signal < 6000) {
    return "Tower Seeker";
  }

  return "Sky Piercer";
}

export function buildMetadata(payload: AcquisitionPayload, signal: number): string[] {
  const lines: string[] = [];

  if (payload.altitude != null && payload.altitude > 250) {
    lines.push("High altitude transmission");
  }

  if (payload.altitude == null) {
    lines.push("Fallback elevation baseline");
  }

  if (payload.accuracy != null && payload.accuracy < 25) {
    lines.push("Precise lock acquired");
  }

  if (payload.batteryLevel != null && payload.batteryLevel < LOW_BATTERY_THRESHOLD) {
    lines.push("Critical power state");
  }

  if (payload.currentHour >= 0 && payload.currentHour <= 5) {
    lines.push("Night carrier");
  }

  if (payload.speed != null && payload.speed < 1.2) {
    lines.push("Stable atmospheric reading");
  }

  if (payload.speed != null && payload.speed > 6) {
    lines.push("Kinetic interference detected");
  }

  if (signal >= 6000) {
    lines.push("Upper-band signal surge");
  }

  if (payload.city != null) {
    lines.push("Regional lock confirmed");
  }

  if (lines.length === 0) {
    lines.push("Transmission window sealed");
  }

  return Array.from(new Set(lines)).slice(0, 4);
}

export function normalizeCallsign(name: string, clientId: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ").slice(0, 26);

  if (trimmed.length > 0) {
    return trimmed.toUpperCase();
  }

  return `RELAY-${clientId.slice(0, 6).toUpperCase()}`;
}

export function createSubmissionRecord(args: {
  clientId: string;
  name: string;
  payload: AcquisitionPayload;
  source?: ArchiveSource;
}): SubmissionRecord {
  const signal = computeSignal(args.payload);

  return {
    id: crypto.randomUUID(),
    name: normalizeCallsign(args.name, args.clientId),
    signal,
    status: getSignalStatus(signal),
    title: getSignalTitle(signal),
    latitude: args.payload.latitude,
    longitude: args.payload.longitude,
    altitude: args.payload.altitude,
    accuracy: args.payload.accuracy,
    batteryLevel: args.payload.batteryLevel,
    city: args.payload.city,
    country: args.payload.country,
    metadata: buildMetadata(args.payload, signal),
    createdAt: args.payload.capturedAt,
    clientId: args.clientId,
    fingerprint: args.clientId,
    source: args.source ?? "local",
  };
}

export function formatLocationLine(city: string | null, country: string | null): string {
  if (city && country) {
    return `${city}, ${country}`;
  }

  if (country) {
    return country;
  }

  if (city) {
    return city;
  }

  return "Unknown origin";
}

export function formatTransmissionTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(timestamp));
}

export function formatSignal(signal: number): string {
  return signal.toLocaleString("en-GB");
}

export function formatAccuracy(accuracy: number | null): string {
  if (accuracy == null) {
    return "unscoped";
  }

  return `${Math.round(accuracy)} m`;
}

export function formatAltitude(altitude: number | null): string {
  if (altitude == null) {
    return "baseline";
  }

  return `${Math.round(altitude)} m`;
}

export function formatBattery(batteryLevel: number | null): string {
  if (batteryLevel == null) {
    return "n/a";
  }

  return `${Math.round(batteryLevel * 100)}%`;
}
