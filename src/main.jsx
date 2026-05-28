import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BB_CSS } from "./theme.js";
import { App } from "./App.jsx";

// Mount global CSS (keyframes, scrollbars, base resets).
const style = document.createElement("style");
style.textContent = BB_CSS;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
