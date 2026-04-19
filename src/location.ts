import type { AcquisitionPayload } from "./types";

interface BatteryManagerLike {
  level: number;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManagerLike>;
}

interface ReverseGeocodeResponse {
  city?: string;
  countryCode?: string;
  countryName?: string;
  locality?: string;
  principalSubdivision?: string;
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Signal geolocation unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Signal permission denied"));
            return;
          case error.TIMEOUT:
            reject(new Error("No stable position lock acquired"));
            return;
          default:
            reject(new Error("Transmission channel unavailable"));
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 9000,
      },
    );
  });
}

async function getBatteryLevel(): Promise<number | null> {
  const navigatorWithBattery = navigator as NavigatorWithBattery;

  if (typeof navigatorWithBattery.getBattery !== "function") {
    return null;
  }

  try {
    const battery = await navigatorWithBattery.getBattery();
    return battery.level;
  } catch {
    return null;
  }
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<{ city: string | null; country: string | null }> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 2400);

  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      {
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return { city: null, country: null };
    }

    const payload = (await response.json()) as ReverseGeocodeResponse;
    const city = payload.locality ?? payload.city ?? payload.principalSubdivision ?? null;
    const country = payload.countryCode ?? payload.countryName ?? null;

    return { city, country };
  } catch {
    return { city: null, country: null };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function collectTransmissionPayload(): Promise<AcquisitionPayload> {
  const capturedAt = new Date();
  const position = await getCurrentPosition();
  const { coords } = position;
  const [batteryLevel, resolvedLocation] = await Promise.all([
    getBatteryLevel(),
    reverseGeocode(coords.latitude, coords.longitude),
  ]);

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    altitude:
      typeof coords.altitude === "number" && Number.isFinite(coords.altitude)
        ? coords.altitude
        : null,
    accuracy:
      typeof coords.accuracy === "number" && Number.isFinite(coords.accuracy)
        ? coords.accuracy
        : null,
    speed: typeof coords.speed === "number" && Number.isFinite(coords.speed) ? coords.speed : null,
    batteryLevel,
    city: resolvedLocation.city,
    country: resolvedLocation.country,
    capturedAt: capturedAt.toISOString(),
    currentHour: capturedAt.getHours(),
  };
}

export function explainAcquisitionError(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Signal acquisition failed";
}
