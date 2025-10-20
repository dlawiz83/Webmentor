import { useState } from "react";

function ModeSelector() {
  const [currentView, setCurrentView] = useState("floating");

  return (
    <div className="backdrop-blur-md bg-white/30 border border-white/40 shadow-sm p-2 w-fit flex gap-1 items-center rounded-xl">
      {["Floating", "Popup", "Sidebar"].map((view) => {
        const key = view.toLowerCase();
        const active = currentView === key;

        return (
          <button
            key={key}
            onClick={() => setCurrentView(key)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200
              ${
                active
                  ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow ring-1 ring-violet-300"
                  : "text-gray-700 bg-white/60 hover:bg-white/80 hover:text-violet-600 border border-violet-200"
              }`}
          >
            {view}
          </button>
        );
      })}
    </div>
  );
}

export default ModeSelector;
