import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Wand2,
  Globe,
  CheckCircle,
  PenLine,
} from "lucide-react";

function Popup() {
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-[370px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 p-6 pb-8">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
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
              <h1 className="text-white font-medium text-lg">WebMentor</h1>
              <p className="text-white/80 text-sm">
                Your AI Learning Assistant
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 space-y-4">
        {actions.map((action, i) => (
          <motion.div
            key={action.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${action.gradient} text-white shadow-md cursor-pointer`}
          >
            <action.icon className="w-6 h-6" />
            <div>
              <h4 className="font-medium">{action.title}</h4>
              <p className="text-sm opacity-80">{action.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default Popup;
