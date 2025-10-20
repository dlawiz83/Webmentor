import React from "react";
import "./index.css";
import "./content.css";
const style = document.createElement("link");
style.rel = "stylesheet";
style.type = "text/css";
style.href = chrome.runtime.getURL("content.css");
document.head.appendChild(style);
import ReactDOM from "react-dom/client";
import { FloatingActionMenu } from "./components/FloatingActionMenu";

let root = null;
let selectedText = "";

// Listen for text selection
document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text.length > 0) {
    selectedText = text;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    showFloatingButton(rect);
  } else {
    hideFloatingButton();
  }
});

function showFloatingButton(rect) {
  if (root) return; // already visible

  // Create a container div
  root = document.createElement("div");
  root.id = "webmentor-floating-root";
  document.body.appendChild(root);

  Object.assign(root.style, {
    position: "absolute",
    top: `${window.scrollY + rect.top - 60}px`,
    left: `${window.scrollX + rect.left + rect.width / 2}px`,
    zIndex: 9999999,
  });

  // Mount React component
  const rootEl = ReactDOM.createRoot(root);
  rootEl.render(
    <FloatingActionMenu
      onActionClick={(action) => {
        console.log("Action:", action, "for text:", selectedText);
        hideFloatingButton();
      }}
    />
  );

  // store React root for cleanup
  root._reactRoot = rootEl;
}

function hideFloatingButton() {
  if (root) {
    root._reactRoot?.unmount();
    root.remove();
    root = null;
  }
}
