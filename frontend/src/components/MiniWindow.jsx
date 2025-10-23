import React, { useEffect, useState } from "react";
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
  Brain,
  Lightbulb,
  Languages,
  ArrowRight,
  Volume2,
  Pause,
  Play,
  Square,
} from "lucide-react";

export function MiniWindow({
  text = "",
  action,
  onClose,
  loading: propLoading = null,
  isError = false,
  onRun = null,
}) {
  // normalize action
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  const actionId = typeof action === "string" ? action : action?.id;
  console.log("MiniWindow received action:", action, "actionId:", actionId);
  const actionTitle =
    typeof action === "string"
      ? (action || "").charAt(0).toUpperCase() + (action || "").slice(1)
      : action?.title || actionId || "";

  // UI config by action id
  const actionConfig = {
    summarize: {
      icon: BookOpen,

      gradient: "from-blue-500 to-cyan-500",
      glowColor: "rgba(59,130,246,0.18)",
      accentColor: "text-blue-500",
      bgAccent: "bg-blue-50",
    },
    simplify: {
      icon: Wand2,

      gradient: "from-amber-400 to-yellow-500",
      glowColor: "rgba(251,191,36,0.18)",
      accentColor: "text-amber-500",
      bgAccent: "bg-amber-50",
    },
    translate: {
      icon: Globe,

      gradient: "from-blue-500 to-violet-500",
      glowColor: "rgba(139,92,246,0.18)",
      accentColor: "text-violet-500",
      bgAccent: "bg-violet-50",
    },
    proofread: {
      icon: CheckCircle,

      gradient: "from-emerald-500 to-teal-500",
      glowColor: "rgba(16,185,129,0.18)",
      accentColor: "text-emerald-500",
      bgAccent: "bg-emerald-50",
    },
    rewrite: {
      icon: PenLine,

      gradient: "from-pink-500 to-rose-500",
      glowColor: "rgba(236,72,153,0.18)",
      accentColor: "text-pink-500",
      bgAccent: "bg-pink-50",
    },
  };

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

  const simplifyOptions = [
    { id: "kids", label: "For kids" },
    { id: "students", label: "For students" },
    { id: "professionals", label: "For professionals" },
  ];

  const [step, setStep] = useState("loading"); // 'input' | 'loading' | 'result' | 'error'
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audio, setAudio] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);

  const handleReadAloud = async () => {
    if (!content?.trim()) return;

    try {
      setPlaying(true);
      // Clean Markdown and HTML tags
      const plainText = content
        .replace(/\*\*/g, "") // remove bold markdown (**)
        .replace(/\*/g, "") // remove italic markdown (*)
        .replace(/#+\s?/g, "") // remove markdown headings
        .replace(/<\/?[^>]+(>|$)/g, "") // remove any HTML tags (e.g., <p>)
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // remove markdown links [text](url)
        .replace(/[`~>]/g, "") // remove other special markdown chars
        .replace(
          /\b(Brain|Sparkles|Lightbulb|ArrowRight|Volume2|Play|Pause|Square)\b/gi,
          ""
        ) // remove icon words
        .replace(/[🎧⭐✨💡🔊🎶🎵]/g, "") // remove emojis just in case
        .replace(/\s{2,}/g, " ") // collapse double spaces
        .trim();

      let detectedLang = "en";
      try {
        if ("LanguageDetector" in self) {
          const detector = await LanguageDetector.create();
          const result = await detector.detect(plainText);
          if (result && result[0]?.detectedLanguage) {
            detectedLang = result[0].detectedLanguage;
          }
        }
      } catch (e) {
        console.warn("Language detection failed, using English.");
      }

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = detectedLang;
      utterance.onend = () => setPlaying(false);
      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        setPlaying(false);
      };
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      setAudio(utterance);
    } catch (err) {
      console.error("Audio error:", err);
      setPlaying(false);
    }
  };

  const handlePause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setPaused(true);
    }
  };

  const handleResume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setPaused(false);
    }
  };

  const handleStop = () => {
    if (speechSynthesis.speaking || speechSynthesis.paused) {
      speechSynthesis.cancel();
      setPlaying(false);
      setPaused(false);
    }
  };

  // translate states
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");

  // simplify states
  const [simplifyMode, setSimplifyMode] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const loading = propLoading !== null ? propLoading : internalLoading;

  useEffect(() => {
    if (!actionId) return;
    // reset
    setContent("");
    setError("");
    setSimplifyMode("");
    setCustomPrompt("");
    setCopied(false);

    if (actionId === "translate") {
      setStep("input");
    } else if (actionId === "simplify") {
      // If text looks like the final output (from background), show result directly
      if (text && !text.toLowerCase().includes("loading simplifier")) {
        setContent(text);
        setStep("result");
      } else {
        setStep("input");
      }
    } else {
      setStep("loading");
      runAction(actionId);
    }
  }, [actionId, text, propLoading]);

  const runAction = async (id, options = {}) => {
    setStep("loading");
    setInternalLoading(true);
    setError("");
    setContent("");

    if (typeof onRun === "function") {
      try {
        const res = await onRun(id, { text, ...options });
        setContent(res || "");
        setStep("result");
        setInternalLoading(false);
        return;
      } catch (err) {
        setError(err?.message || "Action failed");
        setStep("error");
        setInternalLoading(false);
        return;
      }
    }

    setContent("Loading...");
    setStep("loading");
    setInternalLoading(true);
  };

  const handleTranslate = () => {
    runAction("translate", { sourceLang, targetLang });
  };

  const handleSimplify = (mode) => {
    setSimplifyMode(mode);
    // small timeout for smoother UX (mirrors design)
    setTimeout(
      () => runAction("simplify", { simplifyMode: mode, customPrompt }),
      120
    );
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        setCopied(false);
      });
  };

  const handleRetry = () => {
    if (actionId === "translate" || actionId === "simplify") {
      setStep("input");
    } else {
      runAction(actionId);
    }
  };

  if (!actionId) return null;

  const config = actionConfig[actionId] || actionConfig.summarize;
  const Icon = config.icon || BookOpen;

  return (
    <AnimatePresence>
      {true && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 999999999,
            backgroundColor: "rgba(0, 0, 0, 0.2)", // optional to ensure visibility
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Mini Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90vw] max-w-2xl min-w-[300px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
            style={{
              boxShadow: `0 20px 60px rgba(0,0,0,0.18), 0 0 40px ${config.glowColor}`,
            }}
          >
            {/* Header gradient bar */}
            <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div
                  initial={{ rotate: -8, scale: 0.95 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className={`${config.bgAccent} ${config.accentColor} p-2.5 rounded-xl flex-shrink-0`}
                  style={{ boxShadow: `0 6px 18px ${config.glowColor}` }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-gray-900 flex items-center gap-2">
                    <span className="truncate">{actionTitle}</span>
                    <span className="text-lg flex-shrink-0">
                      {config.emoji}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 truncate">WebMentor AI</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all hover:rotate-90 duration-300 flex-shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 min-h-[180px] max-h-[60vh] overflow-y-auto">
              {/* TRANSLATE INPUT */}
              {step === "input" && actionId === "translate" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div
                    className={`${config.bgAccent} rounded-2xl p-3 border border-violet-100`}
                  >
                    <p className="text-sm text-gray-700 italic break-words">
                      "{(text || "").substring(0, 200)}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        From
                      </label>
                      <select
                        className="w-full rounded-xl border px-3 py-2 bg-white"
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                      >
                        {languages.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        To
                      </label>
                      <select
                        className="w-full rounded-xl border px-3 py-2 bg-white"
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                      >
                        {languages.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleTranslate}
                    className={`w-full rounded-xl text-white font-medium py-2.5 bg-gradient-to-r ${config.gradient} hover:shadow-xl transition-all`}
                    style={{ boxShadow: `0 6px 22px ${config.glowColor}` }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Languages className="w-4 h-4" />
                      <span>Translate Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </motion.div>
              )}

              {/* SIMPLIFY INPUT */}
              {step === "input" && actionId === "simplify" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div
                    className={`${config.bgAccent} rounded-2xl p-3 border border-amber-100`}
                  >
                    <p className="text-sm text-gray-700 break-words">
                      How would you like this simplified?
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {simplifyOptions.map((opt) => (
                      <motion.button
                        key={opt.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSimplify(opt.id)}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-left group"
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="text-gray-700">{opt.label}</span>
                        <ArrowRight className="w-4 h-4 ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-all" />
                      </motion.button>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-gray-500">
                        or customize
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      placeholder="Enter custom simplification style..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                    <button
                      onClick={() => handleSimplify("custom")}
                      disabled={!customPrompt.trim()}
                      className={`w-full rounded-xl py-2.5 font-medium text-white bg-gradient-to-r ${config.gradient} transition-all disabled:opacity-50`}
                      style={{ boxShadow: `0 6px 22px ${config.glowColor}` }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        <span>Simplify with Custom Prompt</span>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* LOADING */}
              {step === "loading" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-10 space-y-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className={`w-12 h-12 ${config.accentColor}`} />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <p className={`${config.accentColor}`}>
                      AI is processing...
                    </p>
                    <p className="text-xs text-gray-400">
                      This may take a moment
                    </p>
                  </div>

                  <div className="space-y-3 w-full">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                        className={`h-3 rounded-full opacity-30 bg-gradient-to-r ${config.gradient}`}
                        style={{ width: `${100 - i * 18}%` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* RESULT */}
              {step === "result" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className={`w-4 h-4 ${config.accentColor}`} />
                      <span className="text-xs text-gray-500">
                        AI Generated Result
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <div
                        className="text-gray-800 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: marked.parse(content || ""),
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ERROR */}
              {step === "error" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-red-800">Something went wrong</p>
                    <p className="text-sm text-red-600 mt-1 break-words">
                      {error}
                    </p>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={handleRetry}
                      className="rounded-xl px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <RefreshCcw className="inline w-4 h-4 mr-2" /> Try Again
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {step === "result" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50"
              >
                <div className="flex gap-2 w-full sm:w-auto justify-center">
                  <button
                    onClick={handleRetry}
                    className="rounded-xl px-3 py-2 border border-gray-200 hover:shadow-md"
                  >
                    {" "}
                    <RefreshCcw className="inline w-4 h-4 mr-2" /> Re-run
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`rounded-xl px-3 py-2 text-white font-medium bg-gradient-to-r ${config.gradient}`}
                    style={{ boxShadow: `0 6px 18px ${config.glowColor}` }}
                  >
                    <Copy className="inline w-4 h-4 mr-2" />{" "}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  {!playing && (
                    <button
                      onClick={handleReadAloud}
                      className="rounded-xl px-3 py-2 border border-gray-200 hover:shadow-md flex items-center gap-2 text-violet-600 hover:text-violet-800 font-medium transition"
                    >
                      <Volume2 className="w-4 h-4" /> Read Aloud
                    </button>
                  )}
                  {playing && !paused && (
                    <button
                      onClick={handlePause}
                      className="rounded-xl px-3 py-2 border border-gray-200 hover:shadow-md flex items-center gap-2 text-amber-600 hover:text-amber-800"
                    >
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                  )}
                  {paused && (
                    <button
                      onClick={handleResume}
                      className="rounded-xl px-3 py-2 border border-gray-200 hover:shadow-md flex items-center gap-2 text-emerald-600 hover:text-emerald-800"
                    >
                      <Play className="w-4 h-4" /> Resume
                    </button>
                  )}
                  {playing && (
                    <button
                      onClick={handleStop}
                      className="rounded-xl px-3 py-2 border border-gray-200 hover:shadow-md flex items-center gap-2 text-rose-600 hover:text-rose-800"
                    >
                      <Square className="w-4 h-4" /> Stop
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MiniWindow;
