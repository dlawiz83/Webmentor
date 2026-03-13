import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Wand2,
  Globe,
  CheckCircle,
  PenLine,
  Sparkles,
} from "lucide-react";

const actions = [
  { id: "summarize", icon: BookOpen, label: "Summarize" },
  { id: "simplify", icon: Wand2, label: "Simplify" },
  { id: "translate", icon: Globe, label: "Translate" },
  { id: "proofread", icon: CheckCircle, label: "Proofread" },
  { id: "rewrite", icon: PenLine, label: "Rewrite" },
];

export function FloatingActionMenu({ onActionClick }) {
  const [hovered, setHovered] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      style={{
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        position: "relative",
      }}
    >
      {/* Pill container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          background: "#0f0f0f",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "100px",
          padding: "5px 8px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Brand spark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f59e0b, #f97316)",
            marginRight: 4,
            flexShrink: 0,
          }}
        >
          <Sparkles style={{ width: 13, height: 13, color: "#000" }} />
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 18,
            background: "rgba(255,255,255,0.08)",
            marginRight: 6,
          }}
        />

        {/* Action buttons */}
        {actions.map((action) => {
          const Icon = action.icon;
          const isHovered = hovered === action.id;
          return (
            <motion.button
              key={action.id}
              onHoverStart={() => setHovered(action.id)}
              onHoverEnd={() => setHovered(null)}
              whileTap={{ scale: 0.9 }}
              onClick={() => onActionClick(action.id)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: isHovered ? "5px 10px" : "5px 8px",
                borderRadius: 100,
                border: "none",
                background: isHovered ? "rgba(245,158,11,0.12)" : "transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
                overflow: "visible",
              }}
              title={action.label}
            >
              <Icon
                style={{
                  width: 14,
                  height: 14,
                  color: isHovered ? "#f59e0b" : "rgba(255,255,255,0.55)",
                  transition: "color 0.15s ease",
                  flexShrink: 0,
                }}
              />
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                      fontSize: 11,
                      color: "#f59e0b",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      letterSpacing: "0.03em",
                      overflow: "hidden",
                      display: "block",
                    }}
                  >
                    {action.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Subtle pointer arrow pointing down to selected text */}
      <div
        style={{
          position: "absolute",
          bottom: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 10,
          height: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            background: "#0f0f0f",
            border: "1px solid rgba(255,255,255,0.10)",
            transform: "rotate(45deg)",
            transformOrigin: "center",
            marginTop: -5,
            marginLeft: 0,
          }}
        />
      </div>
    </motion.div>
  );
}
