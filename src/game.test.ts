import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { buildMetadata, computeSignal, getSignalStatus, getSignalTitle } from "./game";
import type { AcquisitionPayload } from "./types";

const basePayload: AcquisitionPayload = {
  latitude: 0,
  longitude: 0,
  altitude: 123,
  accuracy: 12,
  speed: 0.4,
  batteryLevel: 0.14,
  city: "Paris",
  country: "FR",
  capturedAt: "2026-04-18T01:14:00.000Z",
  currentHour: 1,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("computeSignal", () => {
  test("follows the scoring formula from the spec", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.4);

    expect(computeSignal(basePayload, Math.random())).toBe(1506);
  });

  test("falls back to a baseline altitude when altitude is unavailable", () => {
    expect(
      computeSignal(
        {
          ...basePayload,
          altitude: null,
          accuracy: null,
          batteryLevel: null,
          currentHour: 13,
        },
        0,
      ),
    ).toBe(500);
  });
});

describe("status and title mapping", () => {
  test("maps thresholds consistently", () => {
    expect(getSignalStatus(499)).toBe("WEAK");
    expect(getSignalStatus(500)).toBe("UNSTABLE");
    expect(getSignalStatus(1500)).toBe("STABLE");
    expect(getSignalStatus(3000)).toBe("STRONG");
    expect(getSignalStatus(6000)).toBe("ASTRONOMICAL");
    expect(getSignalTitle(400)).toBe("Basement Ghost");
    expect(getSignalTitle(1200)).toBe("Street Receiver");
    expect(getSignalTitle(2200)).toBe("Rooftop Caller");
    expect(getSignalTitle(4200)).toBe("Tower Seeker");
    expect(getSignalTitle(6600)).toBe("Sky Piercer");
  });
});

describe("buildMetadata", () => {
  test("derives flavor tags from collected telemetry", () => {
    expect(buildMetadata(basePayload, 1494)).toEqual([
      "Precise lock acquired",
      "Critical power state",
      "Night carrier",
      "Stable atmospheric reading",
    ]);
  });
});
