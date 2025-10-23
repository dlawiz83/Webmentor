import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Wand2,
  Globe,
  CheckCircle,
  PenLine,
  Loader2,
  Volume2,
} from "lucide-react";

const DEFAULT_OUTPUT_LANGUAGE = "en";
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
];

const actions = [
  {
    id: "summarize",
    title: "Summarize",
    desc: "Get key points instantly",
    icon: BookOpen,
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    id: "simplify",
    title: "Simplify",
    desc: "Make it easier to understand",
    icon: Wand2,
    gradient: "from-violet-400 to-purple-400",
  },
  {
    id: "translate",
    title: "Translate",
    desc: "Convert to another language",
    icon: Globe,
    gradient: "from-emerald-400 to-teal-400",
  },
  {
    id: "proofread",
    title: "Proofread",
    desc: "Fix grammar & style",
    icon: CheckCircle,
    gradient: "from-amber-400 to-orange-400",
  },
  {
    id: "rewrite",
    title: "Rewrite",
    desc: "Improve tone & clarity",
    icon: PenLine,
    gradient: "from-pink-400 to-rose-400",
  },
];

export default function Popup() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [history, setHistory] = useState({});
  const [showTranslateInputs, setShowTranslateInputs] = useState(false);
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  //READ ALOUD CONTROLS
  const speakOutput = async () => {
    if (!output || speaking) return;
    setSpeaking(true);

    let detectedLang = "en";
    try {
      if ("LanguageDetector" in self) {
        const detector = await LanguageDetector.create();
        const detection = await detector.detect(output);
        detectedLang = detection?.[0]?.detectedLanguage || "en";
      }
    } catch (e) {
      console.warn("Language detection failed:", e);
    }

    // Clean output text for speech
    let cleanText = output
      .replace(/\*\*/g, "") // remove bold markers
      .replace(/\*/g, "") // remove italics markers
      .replace(/`/g, "") // remove code markers
      .replace(/#+\s*/g, "") // remove markdown headers
      .replace(/[-•]\s*/g, "") // remove bullet symbols
      .replace(/<\/?[^>]+(>|$)/g, "") // remove any HTML tags
      .replace(/\s+/g, " ") // normalize spaces
      .trim();

    cleanText = cleanText.replace(/^here'?s a simpler version[:\s]*/i, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = detectedLang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setPaused(true);
    }
  };

  const resumeSpeech = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setPaused(false);
    }
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  // === AI ACTION HANDLER ===
  const runAI = async (action) => {
    if (!input.trim()) return;
    console.log(`Running action: ${action.id}`);
    setLoading(true);
    setSelectedAction(action);
    setOutput("Processing...");

    try {
      let result = "";

      switch (action.id) {
        case "summarize": {
          if (!("Summarizer" in self))
            throw new Error("Summarizer API not available (Chrome 138+).");
          const sumAvail = await Summarizer.availability();
          let summarizer;
          if (sumAvail === "downloadable") {
            setOutput("Downloading Summarizer model...");
            summarizer = await Summarizer.create({
              type: "key-points",
              format: "plain-text",
              outputLanguage: DEFAULT_OUTPUT_LANGUAGE,
              monitor(m) {
                m.addEventListener("downloadprogress", (e) => {
                  const percent = Math.round(e.loaded * 100);
                  setOutput(`Downloading Summarizer model... ${percent}%`);
                });
              },
            });
          } else if (sumAvail === "available") {
            summarizer = await Summarizer.create({
              type: "key-points",
              format: "plain-text",
              outputLanguage: DEFAULT_OUTPUT_LANGUAGE,
            });
          } else throw new Error(`Summarizer not ready: ${sumAvail}`);

          setOutput("Summarizing...");
          const sumRes = await summarizer.summarize(input, {
            context: "Summarizing selected text for clarity.",
          });
          result = sumRes
            .replace(/^\s*\*+\s*/gm, "• ")
            .replace(/^\s*-\s*/gm, "• ")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .trim();
          break;
        }

        case "simplify": {
          if (!("LanguageModel" in self))
            throw new Error("Gemini Nano (Prompt API) unavailable");

          const availability = await LanguageModel.availability({
            outputLanguage: "en",
          });

          let session;
          if (
            availability === "downloadable" ||
            availability === "downloading"
          ) {
            session = await LanguageModel.create({
              outputLanguage: "en",
              monitor(m) {
                m.addEventListener("downloadprogress", (e) => {
                  const percent = Math.round(e.loaded * 100);
                  setOutput(`Downloading Gemini Nano model... ${percent}%`);
                });
              },
            });
          } else if (availability === "available") {
            session = await LanguageModel.create({ outputLanguage: "en" });
          } else throw new Error(`LanguageModel not ready: ${availability}`);

          const response = await session.prompt(
            `Simplify the following text while keeping its meaning clear:\n\n${input}`
          );
          result = response;
          break;
        }

        case "translate": {
          if (!showTranslateInputs) {
            setShowTranslateInputs(true);
            setLoading(false);
            setOutput("");
            return;
          }
          if (!("Translator" in self))
            throw new Error("Translator API not supported (Chrome 138+).");
          if (!targetLang.trim())
            throw new Error("Please select a target language.");

          let detected;
          if ("LanguageDetector" in self) {
            const detector = await LanguageDetector.create();
            try {
              const detection = await detector.detect(input);
              detected = detection?.[0]?.detectedLanguage;
            } catch (e) {
              console.warn("LanguageDetector failed:", e);
            }
          }

          const fromLang = sourceLang || detected || "auto";
          setOutput(`Translating ${fromLang} → ${targetLang}...`);

          const translatorAvail = await Translator.availability({
            sourceLanguage: fromLang === "auto" ? undefined : fromLang,
            targetLanguage: targetLang,
          }).catch(() => "available");

          let translator;
          if (translatorAvail === "downloadable") {
            setOutput("Downloading Translator model...");
            translator = await Translator.create({
              sourceLanguage: fromLang === "auto" ? "en" : fromLang,
              targetLanguage: targetLang,
              monitor(m) {
                m.addEventListener("downloadprogress", (e) => {
                  const percent = Math.round(e.loaded * 100);
                  setOutput(`Downloading Translator model... ${percent}%`);
                });
              },
            });
          } else {
            translator = await Translator.create({
              sourceLanguage: fromLang === "auto" ? "en" : fromLang,
              targetLanguage: targetLang,
            });
          }

          const translated = await translator.translate(input);
          result = translated;
          setShowTranslateInputs(false);
          break;
        }

        case "proofread": {
          if (!("Proofreader" in self))
            throw new Error("Proofreader API not available (Chrome 127+).");
          const proof = await Proofreader.create({
            format: "plain-text",
            outputLanguage: DEFAULT_OUTPUT_LANGUAGE,
          });
          const proofRes = await proof.proofread(input);
          result = proofRes?.revisedText || proofRes?.correctedInput || "";
          break;
        }

        case "rewrite": {
          if (!("Rewriter" in self))
            throw new Error("Rewriter API not available (Chrome 127+).");
          const rewriter = await Rewriter.create({
            tone: "more-casual",
            format: "plain-text",
            outputLanguage: DEFAULT_OUTPUT_LANGUAGE,
          });
          const rwRes = await rewriter.rewrite(input, {
            context:
              "Enhance clarity and flow, keeping the same meaning in a friendly tone.",
          });
          result = rwRes || "";
          break;
        }

        default:
          throw new Error("Unknown action");
      }

      setOutput(result);
      setHistory((prev) => {
        const arr = prev[action.id] ? [result, ...prev[action.id]] : [result];
        return { ...prev, [action.id]: arr.slice(0, 3) };
      });
    } catch (err) {
      console.error("AI Error:", err);
      setOutput(
        err?.message ? `Error: ${err.message}` : `Error: ${String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-[380px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
    >
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(139,92,246,0.5)",
                "0 0 0 8px rgba(139,92,246,0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white/20 p-2.5 rounded-2xl"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-white font-medium text-lg">WebMentor</h1>
            <p className="text-white/80 text-sm">Offline AI Assistant</p>
          </div>
        </div>
      </div>

      {/* INPUT */}
      <div className="p-5">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type text to analyze..."
          className="w-full h-28 p-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {/* TRANSLATE INPUTS */}
      {showTranslateInputs && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pb-3"
        >
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-600">
                Source Language (optional)
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="p-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">Auto Detect</option>
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-600">Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="p-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">Select language</option>
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => runAI(actions.find((a) => a.id === "translate"))}
              className="mt-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-sm font-medium py-2 rounded-xl shadow-md hover:opacity-90"
            >
              Translate Now
            </button>
          </div>
        </motion.div>
      )}

      {/* ACTION BUTTONS */}
      <div className="px-5 pb-5 grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <motion.button
            key={a.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => runAI(a)}
            disabled={loading}
            className={`flex items-center gap-2 p-3 rounded-xl text-white bg-gradient-to-r ${
              a.gradient
            } shadow-md ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <a.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{a.title}</span>
          </motion.button>
        ))}
      </div>

      {/* OUTPUT */}
      <AnimatePresence>
        {(output || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pb-5"
          >
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 max-h-[70vh] overflow-y-auto text-sm text-gray-800 whitespace-normal break-words">
              {loading ? (
                <div className="flex items-center justify-center w-full">
                  <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                </div>
              ) : (
                <>
                  <div
                    className="prose prose-sm text-gray-800 w-full leading-relaxed space-y-3"
                    dangerouslySetInnerHTML={{
                      __html: output
                        .replace(/\n{2,}/g, "</p><p>")
                        .replace(/\n/g, "<br/>")
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        .replace(/^>\s*(.*)$/gm, "<blockquote>$1</blockquote>")
                        .replace(/^\s*[-•]\s*(.*)$/gm, "<li>$1</li>")
                        .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
                        .replace(/^(?!<p>)([\s\S]+)$/, "<p>$1</p>"),
                    }}
                  />
                  {/* Read Aloud Button */}
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    {!speaking && (
                      <button
                        onClick={speakOutput}
                        className="flex items-center gap-2 text-violet-600 hover:text-violet-800 font-medium transition"
                      >
                        <Volume2 className="w-4 h-4" />
                        Read Aloud
                      </button>
                    )}

                    {speaking && !paused && (
                      <button
                        onClick={pauseSpeech}
                        className="flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition"
                      >
                        ⏸ Pause
                      </button>
                    )}

                    {paused && (
                      <button
                        onClick={resumeSpeech}
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium transition"
                      >
                        ▶ Resume
                      </button>
                    )}

                    {speaking && (
                      <button
                        onClick={stopSpeech}
                        className="flex items-center gap-2 text-rose-600 hover:text-rose-800 font-medium transition"
                      >
                        ⏹ Stop
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
