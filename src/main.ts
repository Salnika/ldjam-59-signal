import "@fontsource/vt323/400.css";
import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AppQueryProvider } from "./query";

const container = document.querySelector("#app");

if (!container) {
  throw new Error("Application root not found");
}

createRoot(container).render(
  createElement(
    StrictMode,
    null,
    createElement(AppQueryProvider, null, createElement(App)),
  ),
);
