import {
  createGlobalTheme,
  globalStyle,
  keyframes,
  style,
  styleVariants,
} from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  color: {
    background: "#0f0d0a",
    panelOuter: "#32261b",
    panelOuterDark: "#1d1610",
    panelInner: "#26241f",
    panelInnerSoft: "#2d2a24",
    screen: "#171714",
    screenSoft: "#1d1d19",
    border: "#5d4a38",
    borderMuted: "rgba(200, 191, 173, 0.14)",
    textPrimary: "#ded6c8",
    textSecondary: "rgba(200, 191, 173, 0.58)",
    textDim: "rgba(200, 191, 173, 0.34)",
    amber: "#b98d4f",
    amberSoft: "rgba(185, 141, 79, 0.16)",
    olive: "#66705d",
    oliveSoft: "rgba(102, 112, 93, 0.18)",
    fault: "#8f7551",
    black: "rgba(0, 0, 0, 0.54)",
  },
  font: {
    display: '"VT323", "Courier New", monospace',
    body: '"VT323", "Courier New", monospace',
  },
  space: {
    xs: "8px",
    sm: "12px",
    md: "18px",
    lg: "24px",
    xl: "32px",
  },
  radius: {
    sm: "4px",
    md: "10px",
    lg: "18px",
  },
});

const cabinetFloat = keyframes({
  "0%, 100%": { transform: "translateY(0px)" },
  "50%": { transform: "translateY(-4px)" },
});

const ledPulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.42 },
});

const barDrift = keyframes({
  "0%, 100%": { opacity: 0.84, transform: "translateY(0)" },
  "50%": { opacity: 1, transform: "translateY(-1px)" },
});

const traceDrift = keyframes({
  "0%, 100%": { opacity: 0.44 },
  "50%": { opacity: 0.74 },
});

const screenJitter = keyframes({
  "0%, 36%, 71%, 100%": { transform: "translate3d(0, 0, 0)" },
  "36.4%": { transform: "translate3d(0.35px, 0, 0)" },
  "36.8%": { transform: "translate3d(-0.45px, 0.2px, 0)" },
  "37.2%": { transform: "translate3d(0, 0, 0)" },
  "71.2%": { transform: "translate3d(-0.3px, 0.15px, 0)" },
  "71.7%": { transform: "translate3d(0.45px, -0.1px, 0)" },
  "72.1%": { transform: "translate3d(0, 0, 0)" },
});

const scanlineDrift = keyframes({
  "0%": { backgroundPosition: "0 0" },
  "100%": { backgroundPosition: "0 6px" },
});

const lineTearA = keyframes({
  "0%, 15%, 38%, 100%": {
    opacity: 0,
    transform: "translateX(0)",
  },
  "15.4%": {
    opacity: 0.24,
    transform: "translateX(1.4px)",
  },
  "15.8%": {
    opacity: 0.18,
    transform: "translateX(-2.1px)",
  },
  "16.2%": {
    opacity: 0,
    transform: "translateX(0)",
  },
  "38.2%": {
    opacity: 0.22,
    transform: "translateX(2px)",
  },
  "38.6%": {
    opacity: 0.14,
    transform: "translateX(-1.2px)",
  },
  "39%": {
    opacity: 0,
    transform: "translateX(0)",
  },
  "74.4%": {
    opacity: 0.18,
    transform: "translateX(-1.7px)",
  },
  "74.8%": {
    opacity: 0,
    transform: "translateX(0)",
  },
});

const lineTearB = keyframes({
  "0%, 24%, 57%, 100%": {
    opacity: 0,
    transform: "translateX(0)",
  },
  "24.3%": {
    opacity: 0.16,
    transform: "translateX(-1.5px)",
  },
  "24.7%": {
    opacity: 0.11,
    transform: "translateX(1px)",
  },
  "25.1%": {
    opacity: 0,
    transform: "translateX(0)",
  },
  "57.2%": {
    opacity: 0.18,
    transform: "translateX(1.8px)",
  },
  "57.7%": {
    opacity: 0.1,
    transform: "translateX(-1.1px)",
  },
  "58.1%": {
    opacity: 0,
    transform: "translateX(0)",
  },
});

const scanBeam = keyframes({
  "0%": {
    opacity: 0,
    transform: "translateY(-24%)",
  },
  "10%": {
    opacity: 0.06,
  },
  "16%": {
    opacity: 0.12,
  },
  "24%": {
    opacity: 0,
    transform: "translateY(118%)",
  },
  "100%": {
    opacity: 0,
    transform: "translateY(118%)",
  },
});

globalStyle("html", {
  background: vars.color.background,
});

globalStyle("body", {
  margin: 0,
  minHeight: "100vh",
  background: `
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(185, 141, 79, 0.05) 0%, transparent 70%),
    radial-gradient(ellipse 50% 80% at 20% 80%, rgba(102, 112, 93, 0.07) 0%, transparent 60%),
    ${vars.color.background}
  `,
  color: vars.color.textPrimary,
  fontFamily: vars.font.body,
  textRendering: "optimizeLegibility",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});

globalStyle("*", {
  boxSizing: "border-box",
});

globalStyle("button, input", {
  font: "inherit",
  color: "inherit",
});

globalStyle("button", {
  cursor: "pointer",
});

globalStyle("#app", {
  minHeight: "100vh",
});

globalStyle("::selection", {
  background: "rgba(185, 141, 79, 0.2)",
  color: vars.color.textPrimary,
});

export const appShell = style({
  position: "relative",
  minHeight: "100dvh",
  overflow: "hidden",
});

export const desktopModalBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: 20,
  display: "grid",
  placeItems: "center",
  padding: "20px",
  background: "rgba(9, 8, 6, 0.68)",
  backdropFilter: "blur(2px)",
});

export const desktopModalCard = style({
  width: "min(360px, 100%)",
  display: "grid",
  gap: vars.space.sm,
  padding: "18px",
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: `linear-gradient(180deg, ${vars.color.panelInnerSoft} 0%, ${vars.color.panelInner} 100%)`,
  boxShadow:
    "0 18px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
});

export const desktopModalTitle = style({
  margin: 0,
  color: vars.color.textPrimary,
  fontFamily: vars.font.display,
  fontSize: "1.5rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
});

export const desktopModalText = style({
  margin: 0,
  color: vars.color.textSecondary,
  fontSize: "0.8rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
});

export const desktopQrFrame = style({
  width: "100%",
  display: "grid",
  placeItems: "center",
  padding: "12px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderMuted}`,
  background: "rgba(0, 0, 0, 0.24)",
});

export const desktopQrImage = style({
  width: "180px",
  height: "180px",
  display: "block",
  borderRadius: "6px",
  imageRendering: "crisp-edges",
  background: "#fff",
});

export const desktopModalButton = style({
  appearance: "none",
  minHeight: "42px",
  width: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 14px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panelInnerSoft,
  color: vars.color.textPrimary,
  fontFamily: vars.font.display,
  fontSize: "0.86rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.22)",
  selectors: {
    "&:hover": {
      background: "#38342d",
    },
    "&:active": {
      transform: "translateY(1px)",
    },
  },
});

export const ambientGlow = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: `
    radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.025), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 16%)
  `,
});

export const grain = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  opacity: 0.08,
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.32) 0.45px, transparent 0.55px)",
  backgroundSize: "6px 6px",
  mixBlendMode: "overlay",
});

export const layout = style({
  position: "relative",
  zIndex: 1,
  minHeight: "100dvh",
  width: "100%",
  display: "flex",
  alignItems: "stretch",
  justifyContent: "center",
  padding: 0,
});

export const tvWrap = style({
  position: "relative",
  width: "min(100vw, 430px)",
  height: "100dvh",
  filter:
    "drop-shadow(0 30px 60px rgba(0,0,0,0.72)) drop-shadow(0 0 28px rgba(185,141,79,0.06))",
  animation: `${cabinetFloat} 7s ease-in-out infinite`,
});

export const tvCabinet = style({
  width: "100%",
  height: "100%",
  background: `linear-gradient(160deg, ${vars.color.panelOuter} 0%, #271f17 40%, ${vars.color.panelOuterDark} 100%)`,
  borderRadius: "28px 28px 22px 22px",
  paddingTop: "max(14px, env(safe-area-inset-top))",
  paddingRight: "14px",
  paddingBottom: "max(18px, env(safe-area-inset-bottom))",
  paddingLeft: "14px",
  position: "relative",
  display: "grid",
  gridTemplateRows: "minmax(0, 1fr) auto auto",
  gap: vars.space.md,
  border: `2px solid ${vars.color.border}`,
  boxShadow: `
    inset 0 2px 4px rgba(255,255,255,0.06),
    inset 0 -4px 8px rgba(0,0,0,0.5),
    0 8px 0 #1a130d,
    0 12px 0 #130d08
  `,
  selectors: {
    "&::before": {
      content: "",
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      background:
        "repeating-linear-gradient(92deg, transparent 0px, transparent 18px, rgba(0,0,0,0.06) 18px, rgba(0,0,0,0.06) 19px)",
      pointerEvents: "none",
    },
  },
  "@media": {
    "screen and (max-width: 640px)": {
      paddingTop: "max(12px, env(safe-area-inset-top))",
      paddingRight: "12px",
      paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      paddingLeft: "12px",
    },
  },
});

export const tvBezel = style({
  background: "linear-gradient(145deg, #18130f 0%, #0e0c08 100%)",
  borderRadius: vars.radius.lg,
  padding: "14px",
  minHeight: 0,
  display: "flex",
  boxShadow: `
    inset 0 0 0 2px rgba(255,255,255,0.04),
    inset 4px 4px 12px rgba(0,0,0,0.74),
    inset -2px -2px 8px rgba(255,255,255,0.02)
  `,
});

export const tvScreen = style({
  width: "100%",
  height: "100%",
  minHeight: 0,
  position: "relative",
  overflow: "hidden",
  borderRadius: vars.radius.md,
  outline: "none",
  background: vars.color.screen,
  selectors: {
    "&::after": {
      content: "",
      position: "absolute",
      inset: 0,
      borderRadius: vars.radius.md,
      boxShadow: `
        inset 8px 0 20px rgba(0,0,0,0.32),
        inset -8px 0 20px rgba(0,0,0,0.32),
        inset 0 8px 20px rgba(0,0,0,0.24),
        inset 0 -8px 20px rgba(0,0,0,0.24)
      `,
      pointerEvents: "none",
      zIndex: 6,
    },
  },
  "@media": {
    "screen and (max-width: 640px)": {
      minHeight: 0,
    },
  },
});

export const screenBackdrop = style({
  position: "absolute",
  inset: 0,
  background: `
    radial-gradient(circle at 50% 35%, rgba(255,255,255,0.025), transparent 38%),
    linear-gradient(180deg, ${vars.color.screenSoft} 0%, ${vars.color.screen} 100%)
  `,
  zIndex: 0,
});

export const scanlines = style({
  position: "absolute",
  inset: 0,
  background:
    "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
  pointerEvents: "none",
  zIndex: 4,
  mixBlendMode: "multiply",
  animation: `${scanlineDrift} 180ms linear infinite`,
});

export const screenGlitch = style({
  position: "absolute",
  inset: 0,
  zIndex: 3,
  pointerEvents: "none",
  opacity: 0,
  background:
    "repeating-linear-gradient(to bottom, rgba(222,214,200,0.22) 0px, rgba(222,214,200,0.22) 1px, transparent 1px, transparent 5px)",
  mixBlendMode: "screen",
  maskImage:
    "linear-gradient(180deg, transparent 0%, transparent 18%, #000 21%, #000 25%, transparent 28%, transparent 44%, #000 47%, #000 50%, transparent 54%, transparent 73%, #000 76%, #000 79%, transparent 82%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(180deg, transparent 0%, transparent 18%, #000 21%, #000 25%, transparent 28%, transparent 44%, #000 47%, #000 50%, transparent 54%, transparent 73%, #000 76%, #000 79%, transparent 82%, transparent 100%)",
  animation: `${lineTearA} 6.2s steps(1, end) infinite`,
  selectors: {
    "&::before": {
      content: "",
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(180deg, transparent 0%, rgba(222,214,200,0.02) 40%, rgba(222,214,200,0.12) 48%, rgba(222,214,200,0.02) 56%, transparent 100%)",
      opacity: 0,
      transform: "translateY(-24%)",
      animation: `${scanBeam} 4.6s linear infinite`,
    },
    "&::after": {
      content: "",
      position: "absolute",
      inset: 0,
      background:
        "repeating-linear-gradient(to bottom, rgba(0,0,0,0.24) 0px, rgba(0,0,0,0.24) 1px, transparent 1px, transparent 6px)",
      mixBlendMode: "multiply",
      maskImage:
        "linear-gradient(180deg, transparent 0%, transparent 9%, #000 12%, #000 15%, transparent 18%, transparent 58%, #000 61%, #000 64%, transparent 67%, transparent 84%, #000 87%, #000 89%, transparent 92%, transparent 100%)",
      WebkitMaskImage:
        "linear-gradient(180deg, transparent 0%, transparent 9%, #000 12%, #000 15%, transparent 18%, transparent 58%, #000 61%, #000 64%, transparent 67%, transparent 84%, #000 87%, #000 89%, transparent 92%, transparent 100%)",
      opacity: 0,
      animation: `${lineTearB} 7.1s steps(1, end) infinite`,
    },
  },
});

export const screenGlass = style({
  position: "absolute",
  top: "6px",
  left: "8px",
  width: "45%",
  height: "28%",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
  borderRadius: "6px 6px 0 0",
  pointerEvents: "none",
  zIndex: 5,
});

export const screenContent = style({
  position: "relative",
  zIndex: 3,
  height: "100%",
  padding: "16px",
  animation: `${screenJitter} 9.4s steps(1, end) infinite`,
});

export const screenSurface = style({
  height: "100%",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderMuted}`,
  background: "rgba(20, 20, 17, 0.82)",
  boxShadow:
    "inset 0 0 0 1px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02)",
});

export const screenFrame = style({
  height: "100%",
  display: "grid",
  gridTemplateRows: "auto auto minmax(0, 1fr) auto",
  padding: "16px",
  gap: vars.space.sm,
});

export const screenHeader = style({
  display: "grid",
  gap: vars.space.xs,
});

export const screenKicker = style({
  color: vars.color.textSecondary,
  fontFamily: vars.font.display,
  fontSize: "0.74rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
});

export const screenDivider = style({
  width: "100%",
  height: "1px",
  background: vars.color.borderMuted,
});

export const screenTitle = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: "clamp(2rem, 8vw, 3.6rem)",
  lineHeight: 0.92,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: vars.color.textPrimary,
});

export const screenBody = style({
  minHeight: 0,
  overflow: "auto",
  paddingRight: "2px",
});

export const screenFooter = style({
  display: "flex",
  justifyContent: "flex-start",
  paddingTop: vars.space.xs,
  borderTop: `1px solid ${vars.color.borderMuted}`,
});

export const screenStack = style({
  display: "grid",
  gap: vars.space.md,
});

export const introGrid = style({
  display: "grid",
  gap: vars.space.md,
  alignItems: "start",
  "@media": {
    "screen and (min-width: 680px)": {
      gridTemplateColumns: "minmax(0, 1fr) auto",
    },
  },
});

export const introLead = style({
  margin: 0,
  color: vars.color.textPrimary,
  fontFamily: vars.font.display,
  fontSize: "clamp(1rem, 4vw, 1.4rem)",
  lineHeight: 1.35,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
});

export const introLine = style({
  margin: 0,
  color: vars.color.textSecondary,
  fontSize: "0.82rem",
  lineHeight: 1.6,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
});

export const warningPlate = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: "30px",
  padding: "0 10px",
  marginTop: vars.space.sm,
  borderRadius: vars.radius.sm,
  border: `1px solid rgba(185, 141, 79, 0.35)`,
  background: vars.color.amberSoft,
  color: vars.color.amber,
  fontFamily: vars.font.display,
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
});

export const panelList = style({
  display: "grid",
  gap: "4px",
  padding: "12px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderMuted}`,
  background: "rgba(255,255,255,0.02)",
});

export const panelLine = style({
  margin: 0,
  color: vars.color.textSecondary,
  fontSize: "0.76rem",
  lineHeight: 1.6,
  letterSpacing: "0.08em",
});

export const fieldLabel = style({
  display: "block",
  marginBottom: vars.space.xs,
  color: vars.color.textSecondary,
  fontFamily: vars.font.display,
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
});

export const callsignInput = style({
  width: "100%",
  minHeight: "48px",
  padding: "0 14px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.screenSoft,
  color: vars.color.textPrimary,
  outline: "none",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  selectors: {
    "&:focus": {
      borderColor: vars.color.amber,
    },
    "&::placeholder": {
      color: vars.color.textDim,
    },
  },
});

export const screenNote = style({
  margin: 0,
  color: vars.color.textSecondary,
  fontSize: "0.76rem",
  lineHeight: 1.7,
});

export const screenButton = style({
  appearance: "none",
  minHeight: "42px",
  padding: "0 14px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panelInnerSoft,
  color: vars.color.textPrimary,
  fontFamily: vars.font.display,
  fontSize: "0.86rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.22)",
  selectors: {
    "&:hover": {
      background: "#38342d",
    },
    "&:active": {
      transform: "translateY(1px)",
    },
  },
});

export const screenButtonSecondary = style([
  screenButton,
  {
    color: vars.color.textSecondary,
    background: vars.color.panelInner,
  },
]);

export const signalMeter = style({
  display: "flex",
  alignItems: "flex-end",
  gap: "6px",
  minHeight: "90px",
  padding: "12px 12px 10px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.screenSoft,
});

export const signalBar = style({
  width: "12px",
  borderRadius: "2px",
  border: "1px solid rgba(0,0,0,0.18)",
  background: `linear-gradient(180deg, #c59d67, ${vars.color.amber})`,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.18)",
  animation: `${barDrift} 2.6s steps(2, end) infinite`,
});

export const trace = style({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  minHeight: "84px",
  padding: "12px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.screenSoft,
});

export const traceBar = style({
  width: "4px",
  borderRadius: "2px",
  background: vars.color.olive,
  opacity: 0.78,
  animation: `${traceDrift} 2.2s steps(2, end) infinite`,
});

export const systemList = style({
  display: "grid",
  gap: vars.space.xs,
});

export const systemRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.sm,
  padding: "10px 12px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderMuted}`,
  background: vars.color.screenSoft,
  color: vars.color.textSecondary,
  fontSize: "0.76rem",
});

export const systemRowActive = style({
  borderColor: vars.color.amber,
  color: vars.color.textPrimary,
  background: "#23231e",
});

export const metricsGrid = style({
  display: "grid",
  gap: vars.space.xs,
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  "@media": {
    "screen and (min-width: 640px)": {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    },
  },
});

export const metricCard = style({
  padding: "10px 12px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderMuted}`,
  background: vars.color.screenSoft,
});

export const metricLabel = style({
  display: "block",
  color: vars.color.textSecondary,
  fontFamily: vars.font.display,
  fontSize: "0.68rem",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
});

export const metricValue = style({
  display: "block",
  marginTop: vars.space.xs,
  color: vars.color.textPrimary,
  fontSize: "0.88rem",
});

export const ritualCopy = style({
  display: "grid",
  gap: vars.space.xs,
});

export const ritualLine = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: "clamp(1.4rem, 6vw, 2.3rem)",
  lineHeight: 1,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
});

export const ritualLineMuted = style({
  color: vars.color.textSecondary,
});

export const progressTrack = style({
  position: "relative",
  overflow: "hidden",
  width: "100%",
  height: "18px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.screenSoft,
});

export const progressFill = style({
  position: "absolute",
  inset: 0,
  transformOrigin: "left center",
  background: `linear-gradient(90deg, #c59d67, ${vars.color.amber})`,
});

export const resultStack = style({
  display: "grid",
  gap: vars.space.md,
});

export const resultHeader = style({
  display: "flex",
  justifyContent: "space-between",
  gap: vars.space.md,
  alignItems: "flex-start",
  flexWrap: "wrap",
});

export const resultNumber = style({
  margin: 0,
  fontFamily: vars.font.body,
  fontSize: "clamp(3rem, 13vw, 5.4rem)",
  lineHeight: 0.9,
  letterSpacing: "0.04em",
  color: vars.color.amber,
  fontVariantNumeric: "tabular-nums",
});

export const statusPill = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "34px",
  padding: "0 12px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderMuted}`,
  fontFamily: vars.font.display,
  fontSize: "0.74rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
});

export const statusTone = styleVariants({
  WEAK: {
    background: "rgba(105, 111, 99, 0.18)",
    borderColor: "rgba(105, 111, 99, 0.38)",
    color: vars.color.textPrimary,
  },
  UNSTABLE: {
    background: vars.color.amberSoft,
    borderColor: "rgba(185, 141, 79, 0.38)",
    color: vars.color.amber,
  },
  STABLE: {
    background: vars.color.oliveSoft,
    borderColor: "rgba(102, 112, 93, 0.38)",
    color: vars.color.textPrimary,
  },
  STRONG: {
    background: vars.color.oliveSoft,
    borderColor: "rgba(102, 112, 93, 0.48)",
    color: vars.color.textPrimary,
  },
  ASTRONOMICAL: {
    background: vars.color.amberSoft,
    borderColor: "rgba(185, 141, 79, 0.48)",
    color: vars.color.textPrimary,
  },
});

export const titleBlock = style({
  display: "grid",
  gap: vars.space.xs,
});

export const resultTitle = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: "clamp(1.6rem, 6vw, 2.5rem)",
  lineHeight: 1,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
});

export const metadataList = style({
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: vars.space.xs,
});

export const metadataItem = style({
  padding: "10px 12px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderMuted}`,
  background: vars.color.screenSoft,
  color: vars.color.textPrimary,
  fontSize: "0.76rem",
});

export const leaderboard = style({
  display: "grid",
  gap: "6px",
});

export const leaderboardHeader = style({
  display: "grid",
  gridTemplateColumns: "42px minmax(0, 1fr) auto",
  gap: vars.space.sm,
  padding: "0 2px 8px",
  color: vars.color.textDim,
  fontFamily: vars.font.display,
  fontSize: "0.66rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
});

export const leaderboardRow = style({
  display: "grid",
  gridTemplateColumns: "42px minmax(0, 1fr) auto",
  gap: vars.space.sm,
  alignItems: "center",
  padding: "10px 12px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.borderMuted}`,
  background: vars.color.screenSoft,
});

export const leaderboardPlayer = style({
  borderColor: vars.color.amber,
  background: "#22201b",
});

export const leaderboardRank = style({
  color: vars.color.textSecondary,
  fontSize: "0.78rem",
  fontVariantNumeric: "tabular-nums",
});

export const leaderboardName = style({
  margin: 0,
  color: vars.color.textPrimary,
  fontSize: "0.8rem",
  lineHeight: 1.4,
});

export const leaderboardMeta = style({
  margin: "2px 0 0",
  color: vars.color.textSecondary,
  fontSize: "0.68rem",
  lineHeight: 1.4,
});

export const leaderboardSignal = style({
  color: vars.color.amber,
  fontSize: "0.88rem",
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
});

export const alertBox = style({
  padding: "10px 12px",
  borderRadius: vars.radius.sm,
  border: `1px solid rgba(185, 141, 79, 0.4)`,
  background: vars.color.amberSoft,
  color: vars.color.amber,
  fontSize: "0.76rem",
});

export const tvControls = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.md,
  padding: "0 4px",
});

export const tvFooter = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: vars.space.xs,
});

export const tvFooterLink = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "34px",
  padding: "0 10px",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panelInner,
  color: vars.color.textSecondary,
  fontFamily: vars.font.display,
  fontSize: "0.72rem",
  letterSpacing: "0.14em",
  textDecoration: "none",
  textTransform: "uppercase",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.24)",
  selectors: {
    "&:hover": {
      color: vars.color.textPrimary,
      background: vars.color.panelInnerSoft,
    },
  },
});

export const tvBrand = style({
  fontFamily: vars.font.display,
  fontSize: "1.25rem",
  color: vars.color.textSecondary,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
});

export const tvCaption = style({
  marginTop: "2px",
  color: vars.color.textDim,
  fontSize: "0.68rem",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
});

export const indicatorRow = style({
  display: "flex",
  gap: "6px",
  alignItems: "center",
});

export const led = style({
  width: "6px",
  height: "6px",
  borderRadius: "999px",
  background: vars.color.amber,
  boxShadow: "0 0 6px rgba(185,141,79,0.4), 0 0 12px rgba(185,141,79,0.18)",
  animation: `${ledPulse} 2s ease-in-out infinite`,
});

export const indicatorText = style({
  fontFamily: vars.font.body,
  fontSize: "0.74rem",
  color: vars.color.textSecondary,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
});

export const knobs = style({
  display: "flex",
  gap: vars.space.md,
  alignItems: "center",
});

export const knob = style({
  position: "relative",
  width: "32px",
  height: "32px",
  borderRadius: "999px",
  border: `2px solid #3a2a1c`,
  background: "radial-gradient(circle at 35% 30%, #5a4535, #2a1e14)",
  boxShadow: "0 3px 6px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.1)",
  selectors: {
    "&::after": {
      content: "",
      position: "absolute",
      top: "4px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "3px",
      height: "10px",
      borderRadius: "2px",
      background: "rgba(200,191,173,0.52)",
    },
    "&:hover:not(:disabled)": {
      transform: "rotate(18deg)",
    },
    "&:active:not(:disabled)": {
      transform: "rotate(32deg)",
    },
    "&:disabled": {
      cursor: "default",
      opacity: 0.46,
    },
  },
});

export const knobLarge = style([
  knob,
  {
    width: "38px",
    height: "38px",
    selectors: {
      "&::after": {
        content: "",
        position: "absolute",
        top: "5px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "3px",
        height: "12px",
        borderRadius: "2px",
        background: "rgba(200,191,173,0.52)",
      },
      "&:hover:not(:disabled)": {
        transform: "rotate(18deg)",
      },
      "&:active:not(:disabled)": {
        transform: "rotate(32deg)",
      },
      "&:disabled": {
        cursor: "default",
        opacity: 0.46,
      },
    },
  },
]);
