import React, { useState } from "react";
import {
  Sparkles,
  Settings,
  BookOpen,
  Wand2,
  Globe,
  CheckCircle,
  PenLine,
} from "lucide-react";
import { motion } from "framer-motion";

function Popup() {
  const [language, setLanguage] = useState("en");
  const [showSettings, setShowSettings] = useState(false);

  const actions = [
    {
      id: "summarize",
      title: "Summarize",
      description: "Get key points instantly",
      icon: BookOpen,
      gradient: "from-blue-400 to-cyan-400",
    },
    {
      id: "simplify",
      title: "Simplify",
      description: "Make it easier to understand",
      icon: Wand2,
      gradient: "from-violet-400 to-purple-400",
    },
    {
      id: "translate",
      title: "Translate",
      description: "Convert to any language",
      icon: Globe,
      gradient: "from-emerald-400 to-teal-400",
    },
    {
      id: "proofread",
      title: "Proofread",
      description: "Check grammar & style",
      icon: CheckCircle,
      gradient: "from-amber-400 to-orange-400",
    },
    {
      id: "rewrite",
      title: "Rewrite",
      description: "Improve tone & clarity",
      icon: PenLine,
      gradient: "from-pink-400 to-rose-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 p-6 pb-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(139, 92, 246, 0.4)",
                  "0 0 0 8px rgba(139, 92, 246, 0)",
                  "0 0 0 0 rgba(139, 92, 246, 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white/20 backdrop-blur-sm p-2.5 rounded-2xl"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>

            <div>
              <h1 className="text-white font-medium">WebMentor</h1>
              <p className="text-white/80 text-sm">
                Your AI Learning Assistant
              </p>
            </div>
          </div>

          {/* Settings button */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowSettings(!showSettings)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Settings Popover */}
        {showSettings && (
          <div className="absolute right-5 top-16 w-64 p-4 bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-lg z-10">
            <h3 className="text-gray-900 mb-1">Settings</h3>
            <p className="text-gray-500 text-sm mb-2">
              Customize your WebMentor experience
            </p>

            <label className="text-gray-700 text-sm">
              Translation Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option value="en">English</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="zh">Chinese (中文)</option>
            </select>
          </div>
        )}
      </div>

      {/* Actions (same as before) */}
      <div className="p-5 space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-r ${action.gradient} text-white shadow-md cursor-pointer`}
          >
            <action.icon className="w-5 h-5" />
            <div>
              <h4 className="font-medium">{action.title}</h4>
              <p className="text-sm opacity-80">{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Popup;
