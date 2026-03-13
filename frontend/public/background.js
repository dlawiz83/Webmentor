//Session cache
let _languageModelSession = null;
let _summarizerSession = null;
let _proofreaderSession = null;
let _rewriterSession = null;

// Helpers
async function waitForAPI(name, retries = 40, interval = 500) {
  let tries = 0;
  while (!(name in self) && tries < retries) {
    await new Promise((r) => setTimeout(r, interval));
    tries++;
  }
  if (!(name in self))
    throw new Error(`${name} API not available. Use Chrome 138+.`);
}

// Session getters (cached)
async function getLanguageModel() {
  if (_languageModelSession) return _languageModelSession;
  await waitForAPI("LanguageModel");

  const availability = await LanguageModel.availability({
    outputLanguage: "en",
  });
  if (availability !== "available" && availability !== "downloadable")
    throw new Error(`LanguageModel not ready: ${availability}`);

  _languageModelSession = await LanguageModel.create({
    outputLanguage: "en",
    monitor(m) {
      m.addEventListener("downloadprogress", (e) =>
        console.log(`LanguageModel downloaded ${(e.loaded * 100).toFixed(1)}%`),
      );
    },
  });
  return _languageModelSession;
}

async function getSummarizer() {
  if (_summarizerSession) return _summarizerSession;
  await waitForAPI("Summarizer");

  const availability = await Summarizer.availability();
  if (availability !== "available" && availability !== "downloadable")
    throw new Error(`Summarizer not ready: ${availability}`);

  _summarizerSession = await Summarizer.create({
    type: "key-points",
    format: "plain-text",
    length: "medium",
    outputLanguage: "en",
    monitor(m) {
      m.addEventListener("downloadprogress", (e) =>
        console.log(`Summarizer downloaded ${(e.loaded * 100).toFixed(1)}%`),
      );
    },
  });
  return _summarizerSession;
}

async function getProofreader() {
  if (_proofreaderSession) return _proofreaderSession;
  await waitForAPI("Proofreader");

  const availability = await Proofreader.availability();
  if (availability !== "available" && availability !== "downloadable")
    throw new Error(`Proofreader not ready: ${availability}`);

  _proofreaderSession = await Proofreader.create({
    format: "plain-text",
    expectedInputLanguages: ["en"],
    outputLanguage: "en",
    monitor(m) {
      m.addEventListener("downloadprogress", (e) =>
        console.log(`Proofreader downloaded ${(e.loaded * 100).toFixed(1)}%`),
      );
    },
  });
  return _proofreaderSession;
}

async function getRewriter() {
  if (_rewriterSession) return _rewriterSession;
  await waitForAPI("Rewriter");

  const availability = await Rewriter.availability();
  if (availability !== "available" && availability !== "downloadable")
    throw new Error(`Rewriter not ready: ${availability}`);

  _rewriterSession = await Rewriter.create({
    sharedContext:
      "Rewriting text to improve clarity and flow for general readers.",
    tone: "more-casual",
    format: "plain-text",
    length: "as-is",
    expectedInputLanguages: ["en"],
    expectedContextLanguages: ["en"],
    outputLanguage: "en",
    monitor(m) {
      m.addEventListener("downloadprogress", (e) =>
        console.log(`Rewriter downloaded ${(e.loaded * 100).toFixed(1)}%`),
      );
    },
  });
  return _rewriterSession;
}

//Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case "runLanguageModel": {
          const session = await getLanguageModel();
          const result = await session.prompt(message.prompt);
          sendResponse({ result });
          break;
        }

        case "runSummarizer": {
          const summarizer = await getSummarizer();
          const raw = await summarizer.summarize(message.text, {
            context: "Summarizing selected webpage text for clarity.",
          });
          const result = raw
            .replace(/^\s*\*+\s*/gm, "• ")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .trim();
          sendResponse({ result });
          break;
        }

        case "runProofreader": {
          const proofreader = await getProofreader();
          const res = await proofreader.proofread(message.text);
          const result = res?.revisedText || res?.correctedInput;
          if (!result)
            throw new Error("No revised text returned from Proofreader API.");
          sendResponse({ result });
          break;
        }

        case "runRewriter": {
          const rewriter = await getRewriter();
          const result = await rewriter.rewrite(message.text, {
            context:
              "Enhance readability and maintain original meaning. Avoid jargon.",
          });
          if (!result) throw new Error("No output returned from Rewriter API.");
          sendResponse({ result });
          break;
        }

        case "runTranslator": {
          await waitForAPI("Translator");
          const { text, sourceLang, targetLang } = message;

          if (!targetLang) throw new Error("Please select a target language.");

          // Detect source language
          let detectedLang = sourceLang || "en";
          try {
            await waitForAPI("LanguageDetector", 5, 200);
            const detector = await LanguageDetector.create();
            const detection = await detector.detect(text);
            detectedLang =
              detection?.[0]?.detectedLanguage || sourceLang || "en";
          } catch {}

          const availability = await Translator.availability({
            sourceLanguage: detectedLang,
            targetLanguage: targetLang,
          });
          if (availability !== "available" && availability !== "downloadable")
            throw new Error(`Translator not ready: ${availability}`);

          let translator;
          try {
            translator = await Translator.create({
              sourceLanguage: detectedLang,
              targetLanguage: targetLang,
              monitor(m) {
                m.addEventListener("downloadprogress", (e) =>
                  console.log(
                    `Translator downloaded ${(e.loaded * 100).toFixed(1)}%`,
                  ),
                );
              },
            });
          } catch (err) {
            if (err.name === "NotSupportedError") {
              throw new Error(
                `Translation to "${targetLang}" is not supported on this device. Try installing the language pack via chrome://on-device-translation-internals.`,
              );
            }
            throw err;
          }

          const result = await translator.translate(text);
          sendResponse({ result });
          break;
        }

        default:
          sendResponse({ error: `Unknown message type: ${message.type}` });
      }
    } catch (err) {
      console.error(`[WebMentor background] ${message.type} error:`, err);

      // Clear the relevant cache on error so next call retries fresh
      if (message.type === "runLanguageModel") _languageModelSession = null;
      if (message.type === "runSummarizer") _summarizerSession = null;
      if (message.type === "runProofreader") _proofreaderSession = null;
      if (message.type === "runRewriter") _rewriterSession = null;

      sendResponse({ error: err.message });
    }
  })();

  return true; // Keep message channel open for async response
});
