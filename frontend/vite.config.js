import { defineConfig, build } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "./",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
      },
    },
  },
});

// separate build for content script
if (process.env.NODE_ENV === "production") {
  build({
    configFile: false,
    plugins: [react()],
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    build: {
      outDir: "dist",
      emptyOutDir: false,
      cssCodeSplit: false, 
      rollupOptions: {
        input: resolve(__dirname, "src/content-script.jsx"),
        output: {
          entryFileNames: "assets/content.js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return "content.css"; 
            }
            return "assets/[name].[ext]";
          },
        },
      },
    },
  });
}