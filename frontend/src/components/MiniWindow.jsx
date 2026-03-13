import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { marked } from "marked";
import {
  X,
  Copy,
  RefreshCcw,
  BookOpen,
  Wand2,
  Globe,
  CheckCircle,
  PenLine,
  Sparkles,
  Languages,
  ArrowRight,
  Volume2,
  Pause,
  Play,
  Square,
  Lightbulb,
  Check,
} from "lucide-react";

marked.setOptions({ breaks: true, gfm: true });

//  Config

const ACTION_CONFIG = {
  summarize: {
    icon: BookOpen,
    accent: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    label: "Summarize",
  },
  simplify: {
    icon: Wand2,
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    label: "Simplify",
  },
  translate: {
    icon: Globe,
    accent: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    label: "Translate",
  },
  proofread: {
    icon: CheckCircle,
    accent: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    label: "Proofread",
  },
  rewrite: {
    icon: PenLine,
    accent: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    label: "Rewrite",
  },
};

const LANGUAGES = [
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

const SIMPLIFY_OPTIONS = [
  { id: "kids", label: "For kids", hint: "Simple, fun words" },
  { id: "students", label: "For students", hint: "Clear educational tone" },
  { id: "professionals", label: "For professionals", hint: "Concise & direct" },
];

//  Inline styles
const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999999,
    padding: 16,
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
  },
  window: (accent) => ({
    position: "relative",
    width: "90vw",
    maxWidth: 620,
    minWidth: 300,
    background: "#0e0e11",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px ${accent}18`,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "#e8e6e1",
  }),
  accentBar: (accent) => ({
    height: 2,
    background: `linear-gradient(90deg, ${accent}, transparent)`,
  }),
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: (bg, accent) => ({
    width: 34,
    height: 34,
    borderRadius: 10,
    background: bg,
    border: `1px solid ${accent}30`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    marginTop: 1,
    letterSpacing: "0.04em",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.07)",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "rgba(255,255,255,0.4)",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  body: {
    padding: "20px 20px",
    minHeight: 160,
    maxHeight: "60vh",
    overflowY: "auto",
  },
  // Loading
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 0",
    gap: 20,
  },
  loadingLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.03em",
  },
  skeletonBar: (w, accent) => ({
    height: 8,
    width: w,
    borderRadius: 100,
    background: `linear-gradient(90deg, ${accent}20, ${accent}08)`,
    animation: "pulse 1.4s ease-in-out infinite",
  }),
  // Result
  resultLabel: {
    fontSize: 10,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.2)",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  resultContent: {
    fontSize: 14,
    lineHeight: 1.75,
    color: "#d4d0c8",
  },
  // Input steps
  previewBox: (bg, accent) => ({
    background: bg,
    border: `1px solid ${accent}25`,
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 16,
  }),
  previewText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    fontStyle: "italic",
    lineHeight: 1.5,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  select: {
    width: "100%",
    padding: "9px 12px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#e8e6e1",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  label: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 6,
    display: "block",
  },
  primaryBtn: (accent) => ({
    width: "100%",
    padding: "11px",
    background: accent,
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    fontFamily: "inherit",
    transition: "opacity 0.15s",
    marginTop: 14,
  }),
  simplifyOption: (active) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${active ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.07)"}`,
    background: active ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.02)",
    cursor: "pointer",
    transition: "all 0.15s",
    marginBottom: 8,
  }),
  customInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#e8e6e1",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
  },
  // Error
  errorWrap: {
    background: "rgba(239,68,68,0.07)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 12,
    padding: "20px",
    textAlign: "center",
  },
  // Footer
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "12px 18px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.015)",
    flexWrap: "wrap",
  },
  footerBtn: (accent, filled) => ({
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    borderRadius: 8,
    border: filled ? "none" : "1px solid rgba(255,255,255,0.08)",
    background: filled ? accent : "transparent",
    color: filled ? "#fff" : "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: filled ? 600 : 400,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  }),
};

// Component

export function MiniWindow({
  text = "",
  action,
  onClose,
  loading: propLoading = null,
  isError = false,
  onRun = null,
}) {
  const actionId = typeof action === "string" ? action : action?.id;
  const config = ACTION_CONFIG[actionId] || ACTION_CONFIG.summarize;
  const Icon = config.icon;

  const [step, setStep] = useState("loading");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [internalLoading, setIL] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [customPrompt, setCustomPrompt] = useState("");

  const loading = propLoading !== null ? propLoading : internalLoading;

  //  Audio

  const handleReadAloud = async () => {
    if (!content?.trim()) return;
    setPlaying(true);

    const plain = content
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#+\s?/g, "")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/[`~>]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    let lang = "en";
    try {
      if ("LanguageDetector" in self) {
        const d = await LanguageDetector.create();
        const r = await d.detect(plain);
        if (r?.[0]?.detectedLanguage) lang = r[0].detectedLanguage;
      }
    } catch {}

    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.lang = lang;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    speechSynthesis.pause();
    setPaused(true);
  };
  const handleResume = () => {
    speechSynthesis.resume();
    setPaused(false);
  };
  const handleStop = () => {
    speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
  };

  //  Action runner

  useEffect(() => {
    if (!actionId) return;
    setContent("");
    setError("");
    setCustomPrompt("");
    setCopied(false);

    if (actionId === "translate" || actionId === "simplify") {
      setStep("input");
    } else if (propLoading === true) {
      setStep("loading");
    } else if (isError && text) {
      setError(text);
      setStep("error");
    } else if (text && text.trim() !== "") {
      // Result passed directly from content-script — skip straight to result
      setContent(text);
      setStep("result");
    } else {
      setStep("loading");
      runAction(actionId);
    }
  }, [actionId, text, propLoading, isError]);

  const runAction = async (id, options = {}) => {
    setStep("loading");
    setIL(true);
    setError("");
    setContent("");

    if (typeof onRun === "function") {
      try {
        const res = await onRun(id, { text, ...options });
        setContent(res || "");
        setStep("result");
      } catch (err) {
        setError(err?.message || "Action failed.");
        setStep("error");
      } finally {
        setIL(false);
      }
      return;
    }

    setContent("");
    setStep("loading");
    setIL(true);
  };

  const handleTranslate = () =>
    runAction("translate", { sourceLang, targetLang });
  const handleSimplify = (mode) =>
    runAction("simplify", { simplifyMode: mode, customPrompt });

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleRetry = () => {
    if (actionId === "translate" || actionId === "simplify") setStep("input");
    else runAction(actionId);
  };

  if (!actionId) return null;

  //  Render

  return (
    <AnimatePresence>
      <div style={S.overlay}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={S.backdrop}
        />

        {/* Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          style={S.window(config.accent)}
        >
          {/* Accent bar */}
          <div style={S.accentBar(config.accent)} />

          {/* Header */}
          <div style={S.header}>
            <div style={S.headerLeft}>
              <div style={S.iconWrap(config.bg, config.accent)}>
                <Icon style={{ width: 15, height: 15, color: config.accent }} />
              </div>
              <div>
                <div style={S.title}>{config.label}</div>
                <div style={S.subtitle}>WebMentor · on-device AI</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={S.closeBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              }}
            >
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>

          {/* Body */}
          <div style={S.body}>
            {(step === "loading" || loading) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={S.loadingWrap}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Sparkles
                    style={{ width: 28, height: 28, color: config.accent }}
                  />
                </motion.div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      ...S.loadingLabel,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    Processing…
                  </div>
                  <div
                    style={{ ...S.loadingLabel, fontSize: 11, marginTop: 4 }}
                  >
                    Gemini Nano is working
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  {["85%", "68%", "52%"].map((w, i) => (
                    <motion.div
                      key={i}
                      style={S.skeletonBar(w, config.accent)}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/*TRANSLATE INPUT */}
            {step === "input" && actionId === "translate" && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {text && (
                  <div style={S.previewBox(config.bg, config.accent)}>
                    <p style={S.previewText}>"{text.substring(0, 180)}"</p>
                  </div>
                )}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "end",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={S.label}>From</label>
                    <select
                      value={sourceLang}
                      onChange={(e) => setSourceLang(e.target.value)}
                      style={S.select}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ArrowRight
                    style={{
                      width: 16,
                      height: 16,
                      color: "rgba(255,255,255,0.2)",
                      marginBottom: 10,
                    }}
                  />
                  <div>
                    <label style={S.label}>To</label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      style={S.select}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleTranslate}
                  style={S.primaryBtn(config.accent)}
                >
                  <Languages style={{ width: 14, height: 14 }} />
                  Translate
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </motion.div>
            )}

            {/* SIMPLIFY INPUT */}
            {step === "input" && actionId === "simplify" && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 16,
                  }}
                >
                  How should this be simplified?
                </div>
                {SIMPLIFY_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSimplify(opt.id)}
                    style={S.simplifyOption(false)}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#e8e6e1",
                          fontWeight: 500,
                        }}
                      >
                        {opt.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.3)",
                          marginTop: 2,
                        }}
                      >
                        {opt.hint}
                      </div>
                    </div>
                    <ArrowRight
                      style={{
                        width: 14,
                        height: 14,
                        color: "rgba(255,255,255,0.2)",
                      }}
                    />
                  </motion.button>
                ))}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    margin: "14px 0 12px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />
                  <span
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}
                  >
                    or custom
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />
                </div>

                <input
                  style={S.customInput}
                  placeholder="Describe simplification style…"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
                <button
                  onClick={() => handleSimplify("custom")}
                  disabled={!customPrompt.trim()}
                  style={{
                    ...S.primaryBtn(config.accent),
                    opacity: customPrompt.trim() ? 1 : 0.4,
                  }}
                >
                  <Lightbulb style={{ width: 14, height: 14 }} />
                  Apply custom style
                </button>
              </motion.div>
            )}

            {/*RESULT */}
            {step === "result" && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div style={S.resultLabel}>
                  <Sparkles style={{ width: 9, height: 9 }} />
                  AI result
                </div>
                <div
                  style={S.resultContent}
                  className="wm-prose"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(content || ""),
                  }}
                />
              </motion.div>
            )}

            {/*ERROR */}
            {step === "error" && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={S.errorWrap}
              >
                <X
                  style={{
                    width: 24,
                    height: 24,
                    color: "#ef4444",
                    margin: "0 auto 12px",
                  }}
                />
                <div
                  style={{
                    fontSize: 13,
                    color: "#fca5a5",
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Something went wrong
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(252,165,165,0.7)",
                    wordBreak: "break-word",
                  }}
                >
                  {error}
                </div>
                <button
                  onClick={handleRetry}
                  style={{
                    ...S.footerBtn("#ef4444", false),
                    margin: "14px auto 0",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#fca5a5",
                  }}
                >
                  <RefreshCcw style={{ width: 12, height: 12 }} /> Try again
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer (result only) */}
          {step === "result" && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={S.footer}
            >
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={handleRetry}
                  style={S.footerBtn(config.accent, false)}
                >
                  <RefreshCcw style={{ width: 12, height: 12 }} /> Re-run
                </button>
                <button
                  onClick={handleCopy}
                  style={S.footerBtn(config.accent, !copied)}
                >
                  {copied ? (
                    <>
                      <Check style={{ width: 12, height: 12 }} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy style={{ width: 12, height: 12 }} /> Copy
                    </>
                  )}
                </button>

                {/* Audio controls */}
                {!playing && (
                  <button
                    onClick={handleReadAloud}
                    style={S.footerBtn(config.accent, false)}
                  >
                    <Volume2 style={{ width: 12, height: 12 }} /> Read aloud
                  </button>
                )}
                {playing && !paused && (
                  <button
                    onClick={handlePause}
                    style={S.footerBtn("#f59e0b", false)}
                  >
                    <Pause style={{ width: 12, height: 12 }} /> Pause
                  </button>
                )}
                {paused && (
                  <button
                    onClick={handleResume}
                    style={S.footerBtn("#22c55e", false)}
                  >
                    <Play style={{ width: 12, height: 12 }} /> Resume
                  </button>
                )}
                {playing && (
                  <button
                    onClick={handleStop}
                    style={S.footerBtn("rgba(239,68,68,0.8)", false)}
                  >
                    <Square style={{ width: 12, height: 12 }} /> Stop
                  </button>
                )}
              </div>

              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.15)",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                on-device · private
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default MiniWindow;
