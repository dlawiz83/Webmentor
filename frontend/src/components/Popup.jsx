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
  Square,
  Pause,
  Play,
  ChevronRight,
  AlertCircle,
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
  { id: "summarize", title: "Summarize", desc: "Key points", icon: BookOpen },
  { id: "simplify", title: "Simplify", desc: "Plain language", icon: Wand2 },
  { id: "translate", title: "Translate", desc: "Any language", icon: Globe },
  {
    id: "proofread",
    title: "Proofread",
    desc: "Fix grammar",
    icon: CheckCircle,
  },
  { id: "rewrite", title: "Rewrite", desc: "Improve clarity", icon: PenLine },
];

const S = {
  wrap: {
    width: 380,
    background: "#0c0c0e",

    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.07)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "#e8e6e1",
  },
  header: {
    padding: "16px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255,255,255,0.02)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  brandSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginTop: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px rgba(34,197,94,0.6)",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: "#e8e6e1",
    fontSize: 13,
    lineHeight: 1.6,
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  actionBtn: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${active ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`,
    background: active ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "left",
    color: active ? "#f59e0b" : "#e8e6e1",
  }),
  actionLabel: {
    fontSize: 13,
    fontWeight: 500,
  },
  actionDesc: {
    fontSize: 10.5,
    opacity: 0.45,
    marginTop: 1,
  },
  output: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 13,
    lineHeight: 1.7,
    color: "#d4d0c8",
    maxHeight: "50vh",
    overflowY: "auto",
    wordBreak: "break-word",
  },
  outputLabel: {
    fontSize: 10,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.25)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  audioBtn: (color) => ({
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color,
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  }),
  select: {
    width: "100%",
    padding: "8px 10px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#e8e6e1",
    fontSize: 12,
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  label: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 5,
    display: "block",
  },
  translateBtn: {
    width: "100%",
    padding: "10px",
    background: "linear-gradient(135deg, #f59e0b, #f97316)",
    border: "none",
    borderRadius: 10,
    color: "#000",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
};

//Component

export default function Popup() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [showTranslate, setShowTranslate] = useState(false);
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Audio

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
    } catch {}

    const clean = output
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/#+\s*/g, "")
      .replace(/[-•]\s*/g, "")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = detectedLang;
    utterance.rate = 1;
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
    speechSynthesis.pause();
    setPaused(true);
  };
  const resumeSpeech = () => {
    speechSynthesis.resume();
    setPaused(false);
  };
  const stopSpeech = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  //AI runner

  const runAI = async (action) => {
    if (!input.trim()) return;
    setLoading(true);
    setSelectedAction(action);
    setOutput("");

    try {
      let result = "";

      switch (action.id) {
        case "summarize": {
          if (!("Summarizer" in self))
            throw new Error("Summarizer API not available (Chrome 138+).");
          const avail = await Summarizer.availability();
          const summarizer = await Summarizer.create({
            type: "key-points",
            format: "plain-text",
            outputLanguage: DEFAULT_OUTPUT_LANGUAGE,
            ...(avail === "downloadable" && {
              monitor(m) {
                m.addEventListener("downloadprogress", (e) =>
                  setOutput(
                    `Downloading model… ${Math.round(e.loaded * 100)}%`,
                  ),
                );
              },
            }),
          });
          result = (
            await summarizer.summarize(input, {
              context: "Summarize selected text.",
            })
          )
            .replace(/^\s*\*+\s*/gm, "• ")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .trim();
          break;
        }

        case "simplify": {
          if (!("LanguageModel" in self))
            throw new Error("Prompt API unavailable.");
          const avail = await LanguageModel.availability({
            outputLanguage: "en",
          });
          const session = await LanguageModel.create({
            outputLanguage: "en",
            ...(avail === "downloadable" && {
              monitor(m) {
                m.addEventListener("downloadprogress", (e) =>
                  setOutput(
                    `Downloading model… ${Math.round(e.loaded * 100)}%`,
                  ),
                );
              },
            }),
          });
          result = await session.prompt(
            `Simplify this text so it's easy to understand:\n\n${input}`,
          );
          break;
        }

        case "translate": {
          if (!showTranslate) {
            setShowTranslate(true);
            setLoading(false);
            return;
          }
          if (!targetLang.trim()) throw new Error("Select a target language.");
          if (!("Translator" in self))
            throw new Error("Translator API not available (Chrome 138+).");

          let detected;
          try {
            if ("LanguageDetector" in self) {
              const d = await LanguageDetector.create();
              detected = (await d.detect(input))?.[0]?.detectedLanguage;
            }
          } catch {}

          const fromLang = sourceLang || detected || "en";
          const translator = await Translator.create({
            sourceLanguage: fromLang === "auto" ? "en" : fromLang,
            targetLanguage: targetLang,
          });
          result = await translator.translate(input);
          setShowTranslate(false);
          break;
        }

        case "proofread": {
          if (!("Proofreader" in self))
            throw new Error("Proofreader API not available.");
          const proof = await Proofreader.create({
            format: "plain-text",
            outputLanguage: DEFAULT_OUTPUT_LANGUAGE,
          });
          const res = await proof.proofread(input);
          result = res?.revisedText || res?.correctedInput || "";
          break;
        }

        case "rewrite": {
          if (!("Rewriter" in self))
            throw new Error("Rewriter API not available.");
          const rw = await Rewriter.create({
            tone: "more-casual",
            format: "plain-text",
            outputLanguage: DEFAULT_OUTPUT_LANGUAGE,
          });
          result =
            (await rw.rewrite(input, {
              context: "Enhance clarity, keep meaning.",
            })) || "";
          break;
        }

        default:
          throw new Error("Unknown action");
      }

      setOutput(result);
    } catch (err) {
      setOutput(`⚠ ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  //  Render

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={S.wrap}
    >
      {/* Header */}
      <div style={S.header}>
        <div style={S.brand}>
          <div style={S.brandIcon}>
            <Sparkles style={{ width: 16, height: 16, color: "#000" }} />
          </div>
          <div>
            <div style={S.brandName}>WebMentor</div>
            <div style={S.brandSub}>On-device AI</div>
          </div>
        </div>
        <div style={S.statusDot} title="AI ready" />
      </div>

      {/* Input */}
      <div style={{ padding: "14px 16px 0" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="Paste or type text to analyse…"
          rows={4}
          style={{
            ...S.textarea,
            borderColor: inputFocused
              ? "rgba(245,158,11,0.4)"
              : "rgba(255,255,255,0.08)",
            boxShadow: inputFocused
              ? "0 0 0 3px rgba(245,158,11,0.08)"
              : "none",
          }}
        />
        {/* char hint */}
        {input.length > 0 && (
          <div
            style={{
              textAlign: "right",
              fontSize: 10.5,
              color: "rgba(255,255,255,0.2)",
              marginTop: 4,
            }}
          >
            {input.length} chars
          </div>
        )}
      </div>

      {/* Translate extra inputs */}
      <AnimatePresence>
        {showTranslate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", padding: "10px 16px 0" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <div>
                <label style={S.label}>From</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  style={S.select}
                >
                  <option value="">Auto-detect</option>
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>To</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  style={S.select}
                >
                  <option value="">Select…</option>
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => runAI(actions.find((a) => a.id === "translate"))}
              style={{ ...S.translateBtn, marginTop: 10 }}
            >
              <Globe style={{ width: 14, height: 14 }} />
              Translate now
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action grid */}
      <div style={{ padding: "12px 16px" }}>
        <div style={S.actionGrid}>
          {actions.map((a, i) => {
            const Icon = a.icon;
            const isActive = selectedAction?.id === a.id;
            return (
              <motion.button
                key={a.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => runAI(a)}
                disabled={loading}
                style={{
                  ...S.actionBtn(isActive),
                  opacity: loading && !isActive ? 0.5 : 1,
                  gridColumn: i === 4 ? "span 2" : undefined,
                }}
              >
                <Icon
                  style={{
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                    opacity: isActive ? 1 : 0.6,
                  }}
                />
                <div>
                  <div style={S.actionLabel}>{a.title}</div>
                  <div style={S.actionDesc}>{a.desc}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      {(output || loading) && (
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.06)",
            margin: "0 16px",
          }}
        />
      )}

      {/* Output */}
      <AnimatePresence>
        {(output || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            style={{ padding: "14px 16px 16px" }}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px 0",
                  gap: 10,
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 13,
                }}
              >
                <Loader2
                  style={{
                    width: 16,
                    height: 16,
                    animation: "spin 1s linear infinite",
                    color: "#f59e0b",
                  }}
                />
                Processing…
              </div>
            ) : (
              <>
                <div style={S.outputLabel}>
                  <Sparkles style={{ width: 10, height: 10 }} />
                  {selectedAction?.title || "Result"}
                </div>
                <div
                  style={S.output}
                  dangerouslySetInnerHTML={{
                    __html: output
                      .replace(/\n{2,}/g, "</p><p>")
                      .replace(/\n/g, "<br/>")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/^\s*[-•]\s*(.*)$/gm, "<li>$1</li>")
                      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
                      .replace(/^(?!<[pul])([\s\S]+)$/, "<p>$1</p>"),
                  }}
                />

                {/* Audio controls */}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {!speaking && (
                    <button
                      onClick={speakOutput}
                      style={S.audioBtn("rgba(255,255,255,0.45)")}
                    >
                      <Volume2 style={{ width: 12, height: 12 }} /> Read aloud
                    </button>
                  )}
                  {speaking && !paused && (
                    <button onClick={pauseSpeech} style={S.audioBtn("#f59e0b")}>
                      <Pause style={{ width: 12, height: 12 }} /> Pause
                    </button>
                  )}
                  {paused && (
                    <button
                      onClick={resumeSpeech}
                      style={S.audioBtn("#22c55e")}
                    >
                      <Play style={{ width: 12, height: 12 }} /> Resume
                    </button>
                  )}
                  {speaking && (
                    <button
                      onClick={stopSpeech}
                      style={S.audioBtn("rgba(239,68,68,0.7)")}
                    >
                      <Square style={{ width: 12, height: 12 }} /> Stop
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div
        style={{
          padding: "8px 16px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.18)",
            letterSpacing: "0.05em",
          }}
        >
          Powered by Gemini Nano · on-device
        </span>
        <span
          style={{
            fontSize: 10,
            padding: "2px 7px",
            borderRadius: 100,
            background: "rgba(245,158,11,0.1)",
            color: "#f59e0b",
            letterSpacing: "0.05em",
          }}
        >
          v1.0
        </span>
      </div>
    </motion.div>
  );
}
