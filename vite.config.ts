import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/nvidia-api": {
        target: "https://integrate.api.nvidia.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/nvidia-api/, ""),
      },
      "/nvidia-img": {
        target: "https://ai.api.nvidia.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/nvidia-img/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
