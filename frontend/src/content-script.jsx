import "./content.css";

import ReactDOM from "react-dom/client";
import { FloatingActionMenu } from "./components/FloatingActionMenu";
import { MiniWindow } from "./components/MiniWindow";

//  Messaging
function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    const runtime =
      typeof chrome !== "undefined" && chrome.runtime
        ? chrome.runtime
        : typeof browser !== "undefined" && browser.runtime
          ? browser.runtime
          : null;

    if (!runtime || !runtime.sendMessage) {
      reject(new Error("Extension runtime not available."));
      return;
    }

    try {
      runtime.sendMessage(message, (resp) => {
        if (runtime.lastError) {
          const msg = runtime.lastError.message || "";
          if (msg.includes("context invalidated")) {
            reject(
              new Error(
                "Extension was updated. Please refresh this page and try again.",
              ),
            );
          } else {
            reject(new Error(msg));
          }
        } else {
          resolve(resp);
        }
      });
    } catch (err) {
      if (err.message?.includes("context invalidated")) {
        reject(
          new Error(
            "Extension was updated. Please refresh this page and try again.",
          ),
        );
      } else {
        reject(err);
      }
    }
  });
}

// Tokens
const proofreaderToken = import.meta.env.VITE_CHROME_AI_TOKEN;
const rewriterToken = import.meta.env.VITE_REWRITE_TOKEN;

function setupOriginTrialToken(apiType = "proofreader") {
  const existing = document.querySelector('meta[http-equiv="origin-trial"]');
  if (existing) existing.remove();

  const token = apiType === "rewriter" ? rewriterToken : proofreaderToken;
  if (token && token !== "your_token_here") {
    const meta = document.createElement("meta");
    meta.httpEquiv = "origin-trial";
    meta.content = token;
    document.head.append(meta);
  }
}

// Floating button
let root = null;
let selectedText = "";

document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (!text) {
    hideFloatingButton();
    return;
  }
  if (selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  selectedText = text;
  showFloatingButton(rect);
});

function showFloatingButton(rect) {
  if (root) return;

  root = document.createElement("div");
  root.id = "webmentor-floating-root";
  document.body.appendChild(root);

  Object.assign(root.style, {
    position: "absolute",
    top: `${window.scrollY + rect.top - 60}px`,
    left: `${window.scrollX + rect.left + rect.width / 2}px`,
    zIndex: 9999999,
  });

  const rootEl = ReactDOM.createRoot(root);
  rootEl.render(
    <FloatingActionMenu
      onActionClick={(action) => {
        hideFloatingButton();
        showMiniWindow(action, selectedText);
      }}
    />,
  );
  root._reactRoot = rootEl;
}

function hideFloatingButton() {
  if (root) {
    root._reactRoot?.unmount();
    root.remove();
    root = null;
  }
}

//Mini Window
function showMiniWindow(action, text) {
  const existing = document.getElementById("webmentor-mini-window");
  if (existing) existing.remove();

  const mini = document.createElement("div");
  mini.id = "webmentor-mini-window";
  document.body.appendChild(mini);

  Object.assign(mini.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "999999999",
    background: "transparent",
  });

  const rootEl = ReactDOM.createRoot(mini);

  const onClose = () => {
    rootEl.unmount();
    mini.remove();
  };

  const renderLoading = () =>
    rootEl.render(
      <MiniWindow text="" action={action} loading={true} onClose={onClose} />,
    );

  const renderError = (msg) =>
    rootEl.render(
      <MiniWindow
        text={msg}
        action={action}
        isError={true}
        onClose={onClose}
      />,
    );

  const renderResult = (resultText, onRun) =>
    rootEl.render(
      <MiniWindow
        text={resultText}
        action={action}
        onClose={onClose}
        onRun={onRun}
      />,
    );

  // Summarize
  if (action === "summarize") {
    renderLoading();
    (async () => {
      try {
        const resp = await sendMessageToBackground({
          type: "runSummarizer",
          text,
        });
        if (resp.error) throw new Error(resp.error);
        renderResult(resp.result, async () => {
          const r = await sendMessageToBackground({
            type: "runSummarizer",
            text,
          });
          if (r.error) throw new Error(r.error);
          return r.result;
        });
      } catch (err) {
        console.error("Summarizer error:", err);
        renderError(err.message);
      }
    })();

    //Proofread
  } else if (action === "proofread") {
    setupOriginTrialToken("proofreader");
    renderLoading();
    (async () => {
      try {
        const resp = await sendMessageToBackground({
          type: "runProofreader",
          text,
        });
        if (resp.error) throw new Error(resp.error);
        renderResult(resp.result, async () => {
          const r = await sendMessageToBackground({
            type: "runProofreader",
            text,
          });
          if (r.error) throw new Error(r.error);
          return r.result;
        });
      } catch (err) {
        console.error("Proofreader error:", err);
        renderError(err.message);
      }
    })();

    //Rewrite
  } else if (action === "rewrite") {
    setupOriginTrialToken("rewriter");
    renderLoading();
    (async () => {
      try {
        const resp = await sendMessageToBackground({
          type: "runRewriter",
          text,
        });
        if (resp.error) throw new Error(resp.error);
        renderResult(resp.result, async () => {
          const r = await sendMessageToBackground({
            type: "runRewriter",
            text,
          });
          if (r.error) throw new Error(r.error);
          return r.result;
        });
      } catch (err) {
        console.error("Rewriter error:", err);
        renderError(err.message);
      }
    })();

    // Translate
  } else if (action === "translate") {
    rootEl.render(
      <MiniWindow
        text={text}
        action="translate"
        onClose={onClose}
        onRun={async (actionId, options) => {
          const { sourceLang, targetLang } = options;
          const resp = await sendMessageToBackground({
            type: "runTranslator",
            text,
            sourceLang,
            targetLang,
          });
          if (resp.error) throw new Error(resp.error);
          return resp.result;
        }}
      />,
    );

    //Simplify
  } else if (action === "simplify") {
    rootEl.render(
      <MiniWindow
        text=""
        action="simplify"
        onClose={onClose}
        onRun={async (actionId, options) => {
          const prompt =
            options.simplifyMode === "kids"
              ? `Simplify the following text so that a 10-year-old can easily understand it. Use short, fun sentences and simple words:\n\n${text}`
              : options.simplifyMode === "students"
                ? `Simplify the following text for students. Keep the educational meaning clear but easier to read:\n\n${text}`
                : options.simplifyMode === "professionals"
                  ? `Simplify the following text for professionals. Keep it concise, clear, and maintain a professional tone:\n\n${text}`
                  : options.simplifyMode === "custom"
                    ? `Simplify the following text based on this custom instruction: "${options.customPrompt}".\n\n${text}`
                    : `Simplify the following text while keeping its meaning clear and accurate. Use easy-to-understand language:\n\n${text}`;

          const resp = await sendMessageToBackground({
            type: "runLanguageModel",
            text,
            prompt,
          });
          if (resp.error) throw new Error(resp.error);
          return resp.result;
        }}
      />,
    );
  }
}
