import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

import {
  BookOpen,
  Wand2,
  Globe,
  CheckCircle,
  PenLine,
  Sparkles,
} from "lucide-react";

export function FloatingActionMenu({ onActionClick }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      id: "summarize",
      icon: BookOpen,
      label: "Summarize",
      color: "text-blue-500",
    },
    {
      id: "simplify",
      icon: Wand2,
      label: "Simplify",
      color: "text-violet-500",
    },
    {
      id: "translate",
      icon: Globe,
      label: "Translate",
      color: "text-emerald-500",
    },
    {
      id: "proofread",
      icon: CheckCircle,
      label: "Proofread",
      color: "text-amber-500",
    },
    { id: "rewrite", icon: PenLine, label: "Rewrite", color: "text-pink-500" },
  ];

  const handleActionClick = (actionId) => {
    onActionClick(actionId);
    setIsExpanded(false);
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      {/* Main Floating Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative bg-gradient-to-r from-blue-500 to-violet-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center group z-10"
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>

        {/* Pulsing Ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
        />
      </motion.button>

      {/* Expanded Action Menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 border border-gray-100"
          >
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleActionClick(action.id)}
                  className="group relative flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  title={action.label}
                >
                  <div
                    className={`${action.color} p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors`}
                  >
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {action.label}
                  </span>

                  {/* Tooltip on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {action.label}
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
