import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import * as styles from "./app.css";
import {
  createSubmissionRecord,
  formatAccuracy,
  formatAltitude,
  formatBattery,
  formatLocationLine,
  formatSignal,
  formatTransmissionTime,
} from "./game";
import { collectTransmissionPayload, explainAcquisitionError } from "./location";
import { leaderboardQueryKey } from "./query";
import { DuplicateTransmissionError, listLeaderboard, submitSubmission } from "./repository";
import {
  getOrCreateClientId,
  loadRememberedCallsign,
  loadSavedTransmission,
  rememberCallsign,
  saveSuccessfulTransmission,
} from "./storage";
import type { AcquisitionPayload, AppPhase, ArchiveSource, SubmissionRecord } from "./types";
import { ACQUISITION_MESSAGES } from "./types";

const ACQUISITION_MIN_DURATION_MS = 2800;
const HOLD_DURATION_MS = 2200;
const LEADERBOARD_LIMIT = 10;
const SIGNAL_LEVELS = [18, 28, 38, 52, 66];
const TRACE_LEVELS = [14, 22, 36, 52, 30, 16, 24, 48, 34, 14, 26, 40, 18];
const GITHUB_URL = "https://github.com/Salnika/ldjam-59-signal";
const JAM_URL = "https://ldjam.com/events/ludum-dare/59";
const PANEL_LINES = [
  "MOVE FOR A BETTER SIGNAL",
  "SEND ONE READING",
  "DEVICE LOCKS AFTER WRITE",
] as const;

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function describePhase(phase: AppPhase): string {
  switch (phase) {
    case "booting":
      return "READY";
    case "idle":
      return "STANDBY";
    case "acquiring":
      return "READ";
    case "ritual":
      return "HOLD";
    case "submitting":
      return "WRITE";
    case "result":
      return "CAPTURED";
    case "leaderboard":
      return "LEDGER";
    case "locked":
      return "LOCKED";
    case "error":
      return "FAULT";
  }
}

function sourceLabel(source: ArchiveSource): string {
  return source === "supabase" ? "ARCHIVE REMOTE" : "ARCHIVE LOCAL";
}

function SignalMeter(): ReactNode {
  return (
    <div className={styles.signalMeter} aria-hidden="true">
      {SIGNAL_LEVELS.map((height, index) => (
        <span
          key={height}
          className={styles.signalBar}
          style={{
            height: `${height}px`,
            animationDelay: `${index * 160}ms`,
          }}
        />
      ))}
    </div>
  );
}

function TraceDisplay(): ReactNode {
  return (
    <div className={styles.trace} aria-hidden="true">
      {TRACE_LEVELS.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={styles.traceBar}
          style={{
            height: `${height}px`,
            animationDelay: `${index * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

function ScreenPanel({
  action,
  children,
  kicker,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  kicker: string;
  title: string;
}): ReactNode {
  return (
    <div className={styles.screenSurface}>
      <div className={styles.screenFrame}>
        <div className={styles.screenHeader}>
          <div className={styles.screenKicker}>{kicker}</div>
          <div className={styles.screenDivider} />
        </div>
        <h2 className={styles.screenTitle}>{title}</h2>
        <div className={styles.screenBody}>{children}</div>
        {action ? <div className={styles.screenFooter}>{action}</div> : null}
      </div>
    </div>
  );
}

function LeaderboardList({
  entries,
  playerId,
}: {
  entries: SubmissionRecord[];
  playerId: string | null;
}): ReactNode {
  if (entries.length === 0) {
    return <p className={styles.screenNote}>No record.</p>;
  }

  return (
    <div className={styles.leaderboard}>
      <div className={styles.leaderboardHeader}>
        <span>RK</span>
        <span>CALLSIGN</span>
        <span>SIG</span>
      </div>
      {entries.map((entry) => {
        const rowClassName =
          entry.id === playerId
            ? `${styles.leaderboardRow} ${styles.leaderboardPlayer}`
            : styles.leaderboardRow;

        return (
          <div key={entry.id} className={rowClassName}>
            <div className={styles.leaderboardRank}>
              #{entry.rank?.toString().padStart(2, "0") ?? "--"}
            </div>
            <div>
              <p className={styles.leaderboardName}>{entry.name}</p>
              <p className={styles.leaderboardMeta}>
                {entry.title} // {formatLocationLine(entry.city, entry.country)}
              </p>
            </div>
            <div className={styles.leaderboardSignal}>{formatSignal(entry.signal)}</div>
          </div>
        );
      })}
    </div>
  );
}

function ResultScreen({
  archiveSource,
  submission,
}: {
  archiveSource: ArchiveSource;
  submission: SubmissionRecord;
}): ReactNode {
  return (
    <div className={styles.resultStack}>
      <div className={styles.resultHeader}>
        <div>
          <div className={styles.metricLabel}>Signal</div>
          <p className={styles.resultNumber}>{formatSignal(submission.signal)}</p>
        </div>
        <span className={`${styles.statusPill} ${styles.statusTone[submission.status]}`}>
          {submission.status}
        </span>
      </div>

      <div className={styles.titleBlock}>
        <h3 className={styles.resultTitle}>{submission.title}</h3>
        <p className={styles.screenNote}>
          ORIGIN // {formatLocationLine(submission.city, submission.country)}
        </p>
        <p className={styles.screenNote}>STAMP // {formatTransmissionTime(submission.createdAt)}</p>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Elevation</span>
          <span className={styles.metricValue}>{formatAltitude(submission.altitude)}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Precision</span>
          <span className={styles.metricValue}>{formatAccuracy(submission.accuracy)}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Battery</span>
          <span className={styles.metricValue}>{formatBattery(submission.batteryLevel)}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Archive</span>
          <span className={styles.metricValue}>{sourceLabel(archiveSource)}</span>
        </div>
      </div>

      <ul className={styles.metadataList}>
        {submission.metadata.map((line) => (
          <li key={line} className={styles.metadataItem}>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Knob({
  ariaLabel,
  direction,
  disabled,
  onClick,
  large = false,
}: {
  ariaLabel: string;
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  large?: boolean;
}): ReactNode {
  const className = large ? `${styles.knob} ${styles.knobLarge}` : styles.knob;

  return (
    <button
      aria-label={ariaLabel}
      className={className}
      data-direction={direction}
      disabled={disabled}
      onClick={onClick}
      type="button"
    />
  );
}

export function App(): ReactNode {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<AppPhase>("booting");
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [desktopModalDismissed, setDesktopModalDismissed] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [callsign, setCallsign] = useState("");
  const [clientId, setClientId] = useState("");
  const [archiveSource, setArchiveSource] = useState<ArchiveSource>("local");
  const [playerSubmission, setPlayerSubmission] = useState<SubmissionRecord | null>(null);
  const [acquisitionStep, setAcquisitionStep] = useState(0);
  const [pendingPayload, setPendingPayload] = useState<AcquisitionPayload | null>(null);
  const [ritualHoldProgress, setRitualHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [leaderboardReturnPhase, setLeaderboardReturnPhase] = useState<"result" | "locked">(
    "result",
  );

  const submissionStartedRef = useRef(false);
  const holdFrameRef = useRef<number | null>(null);
  const holdStartedAtRef = useRef<number | null>(null);
  const leaderboardQuery = useQuery({
    queryKey: leaderboardQueryKey(LEADERBOARD_LIMIT),
    queryFn: () => listLeaderboard(LEADERBOARD_LIMIT),
  });
  const leaderboardEntries = leaderboardQuery.data?.entries ?? [];
  const deferredLeaderboard = useDeferredValue(leaderboardEntries);
  const submitMutation = useMutation({
    mutationFn: submitSubmission,
  });

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");

    const updateDesktopState = (event?: MediaQueryListEvent) => {
      const nextIsDesktop = event?.matches ?? desktopMediaQuery.matches;
      setIsDesktopViewport(nextIsDesktop);
    };

    updateDesktopState();

    const targetUrl = `${window.location.origin}${window.location.pathname}`;
    const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
    qrUrl.searchParams.set("size", "180x180");
    qrUrl.searchParams.set("margin", "0");
    qrUrl.searchParams.set("format", "png");
    qrUrl.searchParams.set("data", targetUrl);
    setQrCodeUrl(qrUrl.toString());

    if (typeof desktopMediaQuery.addEventListener === "function") {
      desktopMediaQuery.addEventListener("change", updateDesktopState);

      return () => {
        desktopMediaQuery.removeEventListener("change", updateDesktopState);
      };
    }

    desktopMediaQuery.addListener(updateDesktopState);

    return () => {
      desktopMediaQuery.removeListener(updateDesktopState);
    };
  }, []);

  useEffect(() => {
    const storedTransmission = loadSavedTransmission();
    const nextClientId = getOrCreateClientId();

    setClientId(nextClientId);
    setCallsign(loadRememberedCallsign());

    if (storedTransmission.submission) {
      setPlayerSubmission(storedTransmission.submission);
      setArchiveSource(storedTransmission.submission.source);
    }

    setPhase(storedTransmission.locked ? "locked" : "idle");
  }, []);

  useEffect(() => {
    if (!playerSubmission && leaderboardQuery.data?.source) {
      setArchiveSource(leaderboardQuery.data.source);
    }
  }, [leaderboardQuery.data?.source, playerSubmission]);

  useEffect(() => {
    if (phase !== "acquiring") {
      return;
    }

    setAcquisitionStep(0);
    let cancelled = false;

    const intervalId = window.setInterval(() => {
      setAcquisitionStep((currentStep) =>
        Math.min(currentStep + 1, ACQUISITION_MESSAGES.length - 1),
      );
    }, 520);

    void Promise.allSettled([collectTransmissionPayload(), wait(ACQUISITION_MIN_DURATION_MS)]).then(
      (results) => {
        if (cancelled) {
          return;
        }

        const payloadResult = results[0];

        if (payloadResult.status === "rejected") {
          setErrorMessage(explainAcquisitionError(payloadResult.reason));
          setPhase("error");
          return;
        }

        setPendingPayload(payloadResult.value);
        setErrorMessage(null);
        setRitualHoldProgress(0);
        setPhase("ritual");
      },
    );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [phase]);

  const commitTransmission = useEffectEvent(async () => {
    if (!pendingPayload || submissionStartedRef.current) {
      return;
    }

    submissionStartedRef.current = true;
    setPhase("submitting");
    setErrorMessage(null);

    const draft = createSubmissionRecord({
      clientId,
      name: callsign,
      payload: pendingPayload,
    });

    try {
      const result = await submitMutation.mutateAsync(draft);
      saveSuccessfulTransmission(result.player);
      rememberCallsign(callsign);
      queryClient.setQueryData(leaderboardQueryKey(LEADERBOARD_LIMIT), {
        entries: result.leaderboard,
        source: result.source,
      });

      startTransition(() => {
        setPlayerSubmission(result.player);
        setArchiveSource(result.source);
        setLeaderboardReturnPhase("result");
        setPhase("result");
      });
    } catch (error) {
      submissionStartedRef.current = false;

      if (error instanceof DuplicateTransmissionError) {
        const storedTransmission = loadSavedTransmission();

        if (storedTransmission.submission) {
          setPlayerSubmission(storedTransmission.submission);
        }

        setErrorMessage(error.message);
        setLeaderboardReturnPhase("locked");
        setPhase("locked");
        return;
      }

      setErrorMessage("Transmission channel unavailable");
      setPhase("error");
    }
  });

  const clearHoldAnimation = () => {
    if (holdFrameRef.current != null) {
      window.cancelAnimationFrame(holdFrameRef.current);
      holdFrameRef.current = null;
    }
  };

  const stopHolding = useEffectEvent((resetProgress = true) => {
    if (phase !== "ritual" || submissionStartedRef.current) {
      return;
    }

    clearHoldAnimation();
    holdStartedAtRef.current = null;
    setIsHolding(false);

    if (resetProgress) {
      setRitualHoldProgress(0);
    }
  });

  const finishHolding = useEffectEvent(() => {
    clearHoldAnimation();
    holdStartedAtRef.current = null;
    setIsHolding(false);
    setRitualHoldProgress(1);
    void commitTransmission();
  });

  const tickHoldProgress = useEffectEvent((now: number) => {
    const startedAt = holdStartedAtRef.current;

    if (startedAt == null || phase !== "ritual" || submissionStartedRef.current) {
      clearHoldAnimation();
      return;
    }

    const progress = Math.min((now - startedAt) / HOLD_DURATION_MS, 1);
    setRitualHoldProgress(progress);

    if (progress >= 1) {
      finishHolding();
      return;
    }

    holdFrameRef.current = window.requestAnimationFrame(tickHoldProgress);
  });

  const beginTransmission = () => {
    clearHoldAnimation();
    holdStartedAtRef.current = null;
    submissionStartedRef.current = false;
    setPendingPayload(null);
    setErrorMessage(null);
    setRitualHoldProgress(0);
    setIsHolding(false);
    setPhase("acquiring");
  };

  const startHolding = () => {
    if (phase !== "ritual" || submissionStartedRef.current || holdStartedAtRef.current != null) {
      return;
    }

    holdStartedAtRef.current = performance.now();
    setIsHolding(true);
    setRitualHoldProgress(0);
    holdFrameRef.current = window.requestAnimationFrame(tickHoldProgress);
  };

  useEffect(() => {
    if (!isHolding) {
      return;
    }

    const handleRelease = () => {
      stopHolding();
    };

    window.addEventListener("pointerup", handleRelease);
    window.addEventListener("pointercancel", handleRelease);
    window.addEventListener("mouseup", handleRelease);
    window.addEventListener("touchend", handleRelease);
    window.addEventListener("touchcancel", handleRelease);

    return () => {
      window.removeEventListener("pointerup", handleRelease);
      window.removeEventListener("pointercancel", handleRelease);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchend", handleRelease);
      window.removeEventListener("touchcancel", handleRelease);
    };
  }, [isHolding, stopHolding]);

  useEffect(() => {
    if (phase === "ritual") {
      return;
    }

    clearHoldAnimation();
    holdStartedAtRef.current = null;
    setIsHolding(false);
    setRitualHoldProgress(0);
  }, [phase]);

  useEffect(() => {
    return () => {
      clearHoldAnimation();
    };
  }, []);

  const openLeaderboard = (fromPhase: "result" | "locked") => {
    void leaderboardQuery.refetch();
    setLeaderboardReturnPhase(fromPhase);
    setPhase("leaderboard");
  };

  const closeLeaderboard = () => {
    setPhase(leaderboardReturnPhase);
  };

  const handleCabinetKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      (event.key === "ArrowRight" || event.key === " ") &&
      (phase === "result" || phase === "locked")
    ) {
      event.preventDefault();
      openLeaderboard(phase);
    }

    if (event.key === "ArrowLeft" && phase === "leaderboard") {
      event.preventDefault();
      closeLeaderboard();
    }
  };

  const visibleMessages = ACQUISITION_MESSAGES.slice(0, acquisitionStep + 1);
  const readoutNoise = Math.max(4, 18 - acquisitionStep * 2);
  const readoutDrift = Math.max(0.7, 3.6 - acquisitionStep * 0.45).toFixed(1);
  const readoutIntegrity = Math.min(97, 72 + acquisitionStep * 6);
  const cabinetLabel = describePhase(phase);
  const screenId = clientId.slice(0, 8).toUpperCase() || "--------";

  let activeScreen: ReactNode;

  if (phase === "booting" || phase === "idle") {
    activeScreen = (
      <ScreenPanel
        action={
          <button className={styles.screenButton} onClick={beginTransmission} type="button">
            TRANSMIT
          </button>
        }
        kicker="FIELD TEST"
        title="ONE BAR"
      >
        <div className={styles.screenStack}>
          <div className={styles.introGrid}>
            <div>
              <p className={styles.introLead}>Find the strongest place you can.</p>
              <p className={styles.introLine}>
                This device reads your position once and writes one signal to the ledger.
              </p>
              <div className={styles.warningPlate}>ONE TRANSMISSION PER DEVICE</div>
            </div>
            <SignalMeter />
          </div>

          <div className={styles.panelList}>
            {PANEL_LINES.map((line) => (
              <p key={line} className={styles.panelLine}>
                {line}
              </p>
            ))}
            <p className={styles.panelLine}>UNIT {screenId}</p>
          </div>

          <div>
            <label className={styles.fieldLabel} htmlFor="callsign">
              CALLSIGN
            </label>
            <input
              id="callsign"
              className={styles.callsignInput}
              maxLength={26}
              onChange={(event) => {
                setCallsign(event.target.value.toUpperCase());
              }}
              placeholder="RELAY-06"
              value={callsign}
            />
          </div>

          <p className={styles.screenNote}>Move first. Transmit once. Stronger signals rise.</p>
        </div>
      </ScreenPanel>
    );
  } else if (phase === "acquiring") {
    activeScreen = (
      <ScreenPanel kicker="SIGNAL READ" title="WINDOW">
        <div className={styles.screenStack}>
          <p className={styles.screenNote}>Do not move.</p>
          <div className={styles.systemList}>
            {visibleMessages.map((message, index) => {
              const className =
                index === visibleMessages.length - 1
                  ? `${styles.systemRow} ${styles.systemRowActive}`
                  : styles.systemRow;

              return (
                <div key={message} className={className}>
                  <span>{message}</span>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Noise</span>
              <span className={styles.metricValue}>{readoutNoise}%</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Drift</span>
              <span className={styles.metricValue}>{readoutDrift}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Integrity</span>
              <span className={styles.metricValue}>{readoutIntegrity}%</span>
            </div>
          </div>

          <TraceDisplay />
        </div>
      </ScreenPanel>
    );
  } else if (phase === "ritual") {
    activeScreen = (
      <ScreenPanel
        action={
          <button
            className={styles.screenButton}
            onKeyDown={(event) => {
              if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                event.preventDefault();
                startHolding();
              }
            }}
            onKeyUp={(event) => {
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                stopHolding();
              }
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              startHolding();
            }}
            onTouchStart={(event) => {
              event.preventDefault();
              startHolding();
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              startHolding();
            }}
            type="button"
          >
            HOLD
          </button>
        }
        kicker="MANUAL SEAL"
        title="HOLD"
      >
        <div className={styles.screenStack}>
          <div className={styles.ritualCopy}>
            <p className={styles.ritualLine}>RAISE DEVICE</p>
            <p className={styles.ritualLine}>HOLD STILL</p>
            <p className={`${styles.ritualLine} ${styles.ritualLineMuted}`}>KEEP SIGNAL</p>
          </div>

          <TraceDisplay />

          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ transform: `scaleX(${ritualHoldProgress})` }}
            />
          </div>

          <p className={styles.screenNote}>Keep pressure.</p>
        </div>
      </ScreenPanel>
    );
  } else if (phase === "submitting") {
    activeScreen = (
      <ScreenPanel kicker="ARCHIVE WRITE" title="COMMIT">
        <div className={styles.screenStack}>
          <p className={styles.screenNote}>Writing record.</p>
          <TraceDisplay />
        </div>
      </ScreenPanel>
    );
  } else if (phase === "result" && playerSubmission) {
    activeScreen = (
      <ScreenPanel
        action={
          <button
            className={styles.screenButton}
            onClick={() => {
              openLeaderboard("result");
            }}
            type="button"
          >
            OPEN LEDGER
          </button>
        }
        kicker="JUDGMENT"
        title="CAPTURED"
      >
        <ResultScreen archiveSource={archiveSource} submission={playerSubmission} />
      </ScreenPanel>
    );
  } else if (phase === "leaderboard") {
    activeScreen = (
      <ScreenPanel
        action={
          <button className={styles.screenButtonSecondary} onClick={closeLeaderboard} type="button">
            RETURN
          </button>
        }
        kicker="ARCHIVE ORDER"
        title="LEDGER"
      >
        <LeaderboardList entries={deferredLeaderboard} playerId={playerSubmission?.id ?? null} />
      </ScreenPanel>
    );
  } else if (phase === "locked" && playerSubmission) {
    activeScreen = (
      <ScreenPanel
        action={
          <button
            className={styles.screenButton}
            onClick={() => {
              openLeaderboard("locked");
            }}
            type="button"
          >
            OPEN LEDGER
          </button>
        }
        kicker="DEVICE LOCK"
        title="LOCKED"
      >
        <div className={styles.screenStack}>
          <ResultScreen archiveSource={archiveSource} submission={playerSubmission} />
          {errorMessage ? <div className={styles.alertBox}>{errorMessage}</div> : null}
        </div>
      </ScreenPanel>
    );
  } else if (phase === "locked") {
    activeScreen = (
      <ScreenPanel
        action={
          <button
            className={styles.screenButton}
            onClick={() => {
              openLeaderboard("locked");
            }}
            type="button"
          >
            OPEN LEDGER
          </button>
        }
        kicker="DEVICE LOCK"
        title="LOCKED"
      >
        <div className={styles.screenStack}>
          <p className={styles.screenNote}>Record exists. Snapshot missing.</p>
          {errorMessage ? <div className={styles.alertBox}>{errorMessage}</div> : null}
        </div>
      </ScreenPanel>
    );
  } else {
    activeScreen = (
      <ScreenPanel
        action={
          <button
            className={styles.screenButton}
            onClick={() => {
              submissionStartedRef.current = false;
              setIsHolding(false);
              setPendingPayload(null);
              setRitualHoldProgress(0);
              setErrorMessage(null);
              setPhase("idle");
            }}
            type="button"
          >
            RETRY
          </button>
        }
        kicker="SIGNAL FAULT"
        title="FAULT"
      >
        <div className={styles.screenStack}>
          <p className={styles.screenNote}>{errorMessage ?? "Channel lost."}</p>
        </div>
      </ScreenPanel>
    );
  }

  const canGoForward = phase === "result" || phase === "locked";
  const canGoBackward = phase === "leaderboard";
  const showDesktopModal = isDesktopViewport && !desktopModalDismissed && qrCodeUrl.length > 0;

  return (
    <div className={styles.appShell}>
      {showDesktopModal ? (
        <div className={styles.desktopModalBackdrop} role="presentation">
          <div
            aria-label="Best experience on mobile"
            aria-modal="true"
            className={styles.desktopModalCard}
            role="dialog"
          >
            <p className={styles.desktopModalTitle}>Best experience on mobile</p>
            <p className={styles.desktopModalText}>Scan to open ONE BAR on your phone.</p>
            <div className={styles.desktopQrFrame}>
              <img alt="QR code to open ONE BAR on mobile" className={styles.desktopQrImage} src={qrCodeUrl} />
            </div>
            <button
              className={styles.desktopModalButton}
              onClick={() => {
                setDesktopModalDismissed(true);
              }}
              type="button"
            >
              CONTINUE ON DESKTOP
            </button>
          </div>
        </div>
      ) : null}
      <div className={styles.ambientGlow} />
      <div className={styles.grain} />
      <main className={styles.layout}>
        <div className={styles.tvWrap}>
          <div className={styles.tvCabinet}>
            <div className={styles.tvBezel}>
              <div className={styles.tvScreen} onKeyDown={handleCabinetKeyDown} tabIndex={0}>
                <div className={styles.screenBackdrop} />
                <div className={styles.screenGlitch} />
                <div className={styles.scanlines} />
                <div className={styles.screenGlass} />
                <div className={styles.screenContent}>{activeScreen}</div>
              </div>
            </div>

            <div className={styles.tvControls}>
              <div>
                <div className={styles.tvBrand}>ONE BAR</div>
                <div className={styles.tvCaption}>FIELD SIGNAL RELAY</div>
              </div>

              <div className={styles.indicatorRow}>
                <div className={styles.led} />
                <span className={styles.indicatorText}>{cabinetLabel}</span>
              </div>

              <div className={styles.knobs}>
                <Knob
                  ariaLabel="Previous screen"
                  direction="left"
                  disabled={!canGoBackward}
                  onClick={closeLeaderboard}
                />
                <Knob
                  ariaLabel="Next screen"
                  direction="right"
                  disabled={!canGoForward}
                  large
                  onClick={() => {
                    if (phase === "result" || phase === "locked") {
                      openLeaderboard(phase);
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.tvFooter}>
              <a className={styles.tvFooterLink} href={GITHUB_URL} rel="noreferrer" target="_blank">
                GITHUB
              </a>
              <a className={styles.tvFooterLink} href={JAM_URL} rel="noreferrer" target="_blank">
                LD59
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
