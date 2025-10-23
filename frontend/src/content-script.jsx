import "./content.css";
import React from "react";

import ReactDOM from "react-dom/client";
import { FloatingActionMenu } from "./components/FloatingActionMenu";
import { MiniWindow } from "./components/MiniWindow";
// Helper to send messages to the background safely
function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    const runtime =
      typeof chrome !== "undefined" && chrome.runtime
        ? chrome.runtime
        : typeof browser !== "undefined" && browser.runtime
        ? browser.runtime
        : null;

    if (!runtime || !runtime.sendMessage) {
      // Friendly error so UI can show it instead of throwing
      reject(
        new Error(
          "Extension runtime not available (chrome.runtime undefined). " +
            "Make sure this code runs as a content script (registered in manifest), not injected into the page."
        )
      );
      return;
    }

    try {
      runtime.sendMessage(message, (resp) => {
        // check for chrome.runtime.lastError
        if (typeof runtime.lastError !== "undefined" && runtime.lastError) {
          reject(new Error(runtime.lastError.message));
        } else {
          resolve(resp);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

const proofreaderToken = import.meta.env.VITE_CHROME_AI_TOKEN;
const rewriterToken = import.meta.env.VITE_REWRITE_TOKEN;
let root = null;
let selectedText = "";
const DEFAULT_OUTPUT_LANGUAGE = "en";
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

// Floating Action Menu
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
    />
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

// Setup origin trial token for Chrome AI APIs
function setupOriginTrialToken(apiType = "proofreader") {
  // Remove any existing token
  const existingMeta = document.querySelector(
    'meta[http-equiv="origin-trial"]'
  );
  if (existingMeta) existingMeta.remove();

  const token = apiType === "rewriter" ? rewriterToken : proofreaderToken;

  if (token && token !== "your_token_here") {
    const otMeta = document.createElement("meta");
    otMeta.httpEquiv = "origin-trial";
    otMeta.content = token;
    document.head.append(otMeta);
    console.log(` Origin trial token set up successfully for ${apiType}`);
  } else {
    console.warn(` ${apiType} token not found or not configured`);
  }
}

// Mini Window for AI actions
function showMiniWindow(action, text) {
  const existingMini = document.getElementById("webmentor-mini-window");
  if (existingMini) existingMini.remove();
  const mini = document.createElement("div");
  mini.id = "webmentor-mini-window";
  document.body.appendChild(mini);
  console.log(
    " MiniWindow container added to DOM:",
    document.getElementById("webmentor-mini-window")
  );

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
  setupOriginTrialToken(action);
  // If the user clicked "proofread", call the API directly
  if (action === "proofread") {
    setupOriginTrialToken("proofreader");

    // Initial render — show loading MiniWindow immediately
    rootEl.render(
      <MiniWindow
        text="Loading proofreader..."
        action="proofread"
        loading={true}
        onClose={() => {
          rootEl.unmount();
          mini.remove();
        }}
      />
    );

    (async () => {
      try {
        console.log("Starting proofreader check...");

        // Wait for Proofreader API to appear
        let retries = 0;
        while (!("Proofreader" in self) && retries < 15) {
          await new Promise((r) => setTimeout(r, 300));
          retries++;
        }

        if (!("Proofreader" in self)) {
          throw new Error(
            "Proofreader API not available. Make sure you're using Chrome 127+ and have a valid Origin Trial token."
          );
        }

        console.log("Checking Proofreader availability...");
        const availability = await Proofreader.availability();
        console.log("Proofreader availability:", availability);

        let proofreader;

        // Handle availability states
        if (availability === "downloadable" || availability === "downloading") {
          rootEl.render(
            <MiniWindow
              text="Downloading proofreader model... This may take a few minutes on first use."
              action="proofread"
              loading={true}
              onClose={() => {
                rootEl.unmount();
                mini.remove();
              }}
            />
          );

          proofreader = await Proofreader.create({
            format: "plain-text",
            expectedInputLanguages: ["en"],
            outputLanguage: "en",
            monitor(m) {
              m.addEventListener("downloadprogress", (e) =>
                console.log(
                  `Proofreader model downloaded ${(e.loaded * 100).toFixed(1)}%`
                )
              );
            },
          });
        } else if (availability !== "available") {
          throw new Error(`Proofreader model not ready yet: ${availability}`);
        } else {
          proofreader = await Proofreader.create({
            format: "plain-text",
            expectedInputLanguages: ["en"],
            outputLanguage: "en",
          });
        }

        console.log("Running proofreader...");
        const result = await proofreader.proofread(text);
        console.log("Proofreader result:", result);

        const finalText = result?.revisedText || result?.correctedInput;

        if (!finalText) {
          throw new Error("No revised text returned from Proofreader API.");
        }

        rootEl.render(
          <MiniWindow
            text={finalText}
            action="proofread"
            onClose={() => {
              rootEl.unmount();
              mini.remove();
            }}
            onRun={async () => {
              const reProof = await Proofreader.create({
                format: "plain-text",
                expectedInputLanguages: ["en"],
                outputLanguage: "en",
              });
              const rerun = await reProof.proofread(text);
              return (
                rerun?.revisedText || rerun?.correctedInput || "No output."
              );
            }}
          />
        );
      } catch (err) {
        console.error("Proofreader error:", err);
        rootEl.render(
          <MiniWindow
            text={`Error: ${err.message}

Please check:
1. Chrome 127+ or newer
2. VITE_CHROME_AI_TOKEN in .env
3. Origin trial enabled and valid`}
            action="proofread"
            isError={true}
            onClose={() => {
              rootEl.unmount();
              mini.remove();
            }}
          />
        );
      }
    })();
  } else if (action === "summarize") {
    //  create root only once
    const rootEl = ReactDOM.createRoot(mini);

    // show loading state
    rootEl.render(
      <MiniWindow
        text="Loading summarizer..."
        action="summarize"
        loading={true}
        onClose={() => {
          rootEl.unmount();
          mini.remove();
        }}
      />
    );

    (async () => {
      try {
        console.log("Checking Summarizer availability...");
        if (!("Summarizer" in self))
          throw new Error("Summarizer API not available. Use Chrome 138+.");

        const availability = await Summarizer.availability();
        console.log("Summarizer availability:", availability);

        const options = {
          type: "key-points",
          format: "plain-text",
          length: "medium",
          outputLanguage: "en",
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              console.log(`Downloaded ${(e.loaded * 100).toFixed(1)}%`);
            });
          },
        };

        let summarizer;
        if (availability === "downloadable") {
          rootEl.render(
            <MiniWindow
              text="Downloading summarizer model... This may take a few minutes."
              action="summarize"
              loading={true}
              onClose={() => {
                rootEl.unmount();
                mini.remove();
              }}
            />
          );
          summarizer = await Summarizer.create(options);
        } else if (availability !== "available") {
          throw new Error(`Summarizer not ready: ${availability}`);
        } else {
          summarizer = await Summarizer.create(options);
        }

        console.log("Summarizer session ready. Summarizing...");
        const result = await summarizer.summarize(text, {
          context: "Summarizing selected webpage text for clarity.",
        });

        console.log("Summarizer result:", result);
        let cleaned = result
          .replace(/^\s*\*+\s*/gm, "• ") // convert leading * to nice bullets
          .replace(/\*\*(.*?)\*\*/g, "$1") // remove bold markers
          .replace(/\*(.*?)\*/g, "$1") // remove italic markers
          .trim();

        console.log("Summarizer cleaned result:", cleaned);

        // re-render MiniWindow with result
        rootEl.render(
          <MiniWindow
            text={text}
            action="summarize"
            onClose={() => {
              rootEl.unmount();
              mini.remove();
            }}
            onRun={async () => {
              // This will run when the user presses "Re-run"
              const reSummarizer = await Summarizer.create(options);
              const newResult = await reSummarizer.summarize(text, {
                context: "Summarizing selected webpage text for clarity.",
              });
              return newResult
                .replace(/^\s*\*+\s*/gm, "• ")
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .replace(/\*(.*?)\*/g, "$1")
                .trim();
            }}
          />
        );
      } catch (err) {
        console.error("Summarizer error:", err);
        rootEl.render(
          <MiniWindow
            text={`Error: ${err.message}`}
            action="summarize"
            loading={false}
            isError={true}
            onClose={() => {
              rootEl.unmount();
              mini.remove();
            }}
          />
        );
      }
    })();
  } else if (action === "rewrite") {
    // Set up origin trial token
    setupOriginTrialToken("rewriter");

    rootEl.render(
      <MiniWindow
        text="Loading rewriter..."
        action="rewrite"
        loading={true}
        onClose={() => {
          rootEl.unmount();
          mini.remove();
        }}
      />
    );

    (async () => {
      try {
        console.log(" Starting Rewriter API call...");

        if (!("Rewriter" in self)) {
          throw new Error(
            "Rewriter API not available. Make sure you have Chrome 127+ and the origin trial enabled."
          );
        }

        console.log("Checking Rewriter availability...");
        let availability = await Rewriter.availability();
        console.log(" Current Rewriter availability:", availability);

        const options = {
          sharedContext:
            "This text is being rewritten to improve clarity and flow for general readers.",
          tone: "more-casual", // can be: "more-formal", "as-is", "more-casual"
          format: "plain-text", // can be: "as-is", "markdown", "plain-text"
          length: "as-is", // can be: "shorter", "as-is", "longer"
          expectedInputLanguages: ["en"],
          expectedContextLanguages: ["en"],
          outputLanguage: "en",
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              console.log(
                ` Rewriter model downloaded: ${(e.loaded * 100).toFixed(1)}%`
              );
            });
          },
        };

        let rewriter;

        // Handle different model statuses
        if (availability === "downloadable") {
          console.log(
            "Model downloadable, creating session to trigger download..."
          );
          rootEl.render(
            <MiniWindow
              text="Downloading Rewriter model... This may take several minutes on first use."
              action="rewrite"
              loading={true}
              onClose={() => {
                rootEl.unmount();
                mini.remove();
              }}
            />
          );
          rewriter = await Rewriter.create(options);
        } else if (availability !== "available") {
          throw new Error(
            `Rewriter model not ready yet. Status: ${availability}`
          );
        } else {
          rewriter = await Rewriter.create(options);
        }

        console.log("Rewriter session ready. Rewriting text...");
        const result = await rewriter.rewrite(text, {
          context:
            "Enhance readability and maintain original meaning. Avoid jargon and overly formal phrasing.",
        });

        console.log(" Rewriter result:", result);

        if (!result) {
          throw new Error("No output returned from Rewriter API.");
        }

        rootEl.render(
          <MiniWindow
            text={result}
            action="rewrite"
            onClose={() => {
              rootEl.unmount();
              mini.remove();
            }}
            onRun={async () => {
              const rewriter = await Rewriter.create({
                sharedContext:
                  "This text is being rewritten to improve clarity and flow for general readers.",
                tone: "more-casual",
                format: "plain-text",
                length: "as-is",
                expectedInputLanguages: ["en"],
                expectedContextLanguages: ["en"],
                outputLanguage: "en",
              });

              const newResult = await rewriter.rewrite(text, {
                context:
                  "Enhance readability and maintain original meaning. Avoid jargon and overly formal phrasing.",
              });
              return newResult;
            }}
          />
        );
      } catch (err) {
        console.error(" Rewriter error:", err);
        rootEl.render(
          <MiniWindow
            text={`Error: ${err.message}

Please check:
1. Chrome 127+ and Origin Trial enabled
2. Token is correct in .env and manifest
3. Rewriter model fully downloaded`}
            action="rewrite"
            loading={false}
            isError={true}
            onClose={() => {
              rootEl.unmount();
              mini.remove();
            }}
          />
        );
      }
    })();
  } else if (action === "translate") {
    const rootEl = ReactDOM.createRoot(mini);

    // Initial render — show input UI in MiniWindow
    rootEl.render(
      <MiniWindow
        text={text}
        action="translate"
        onClose={() => {
          rootEl.unmount();
          mini.remove();
        }}
        onRun={async (actionId, options) => {
          try {
            const { sourceLang, targetLang } = options; // received from MiniWindow input

            if (!targetLang)
              throw new Error("Please select a target language.");
            console.log(
              "Running Translator with:",
              sourceLang,
              "→",
              targetLang
            );

            // Detect language
            if (!("LanguageDetector" in self))
              throw new Error(
                "LanguageDetector API not supported. Use Chrome 138+."
              );

            const detector = await LanguageDetector.create({
              monitor(m) {
                m.addEventListener("downloadprogress", (e) => {
                  console.log(
                    `Language model downloaded ${(e.loaded * 100).toFixed(1)}%`
                  );
                });
              },
            });

            const detectionResults = await detector.detect(text);
            const detectedLanguage =
              detectionResults[0]?.detectedLanguage || sourceLang || "en";
            console.log("Detected language:", detectedLanguage);

            //  Check Translator availability
            if (!("Translator" in self))
              throw new Error("Translator API not supported. Use Chrome 138+.");

            const availability = await Translator.availability({
              sourceLanguage: detectedLanguage,
              targetLanguage: targetLang,
            });
            console.log("Translator availability:", availability);

            let translator;
            if (availability === "downloadable") {
              console.log("Downloading Translator model...");
              translator = await Translator.create({
                sourceLanguage: detectedLanguage,
                targetLanguage: targetLang,
                monitor(m) {
                  m.addEventListener("downloadprogress", (e) => {
                    console.log(
                      `Translator model downloaded ${(e.loaded * 100).toFixed(
                        1
                      )}%`
                    );
                  });
                },
              });
            } else if (availability !== "available") {
              throw new Error(`Translator model not ready: ${availability}`);
            } else {
              translator = await Translator.create({
                sourceLanguage: detectedLanguage,
                targetLanguage: targetLang,
              });
            }

            // Translate
            const translated = await translator.translate(text);
            console.log("Translated result:", translated);
            return translated;
          } catch (err) {
            console.error("Translation error:", err);
            throw err;
          }
        }}
      />
    );
  } else if (action === "simplify") {
    const rootEl = ReactDOM.createRoot(mini);

    rootEl.render(
      <MiniWindow
        text=""
        action="simplify"
        onClose={() => {
          rootEl.unmount();
          mini.remove();
        }}
        onRun={async (actionId, options) => {
          try {
            const response = await sendMessageToBackground({
              type: "runLanguageModel",
              text,
              prompt:
                options.simplifyMode === "kids"
                  ? `Simplify the following text so that a 10-year-old can easily understand it. Use short, fun sentences and simple words:\n\n${text}`
                  : options.simplifyMode === "students"
                  ? `Simplify the following text for students. Keep the educational meaning clear but easier to read:\n\n${text}`
                  : options.simplifyMode === "professionals"
                  ? `Simplify the following text for professionals. Keep it concise, clear, and maintain a professional tone:\n\n${text}`
                  : options.simplifyMode === "custom"
                  ? `Simplify the following text based on this custom instruction: "${options.customPrompt}".\n\n${text}`
                  : `Simplify the following text while keeping its meaning clear and accurate.
Use easy-to-understand language suitable for a general audience:\n\n${text}`,
            });

            if (response.error) throw new Error(response.error);
            return response.result;
          } catch (err) {
            console.error("Simplify error:", err);
            throw err;
          }
        }}
      />
    );
  }
}
