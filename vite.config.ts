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
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](@?react|react-dom|react-router-dom)[\\/]/.test(id)) return "vendor-react";
          if (id.includes("@supabase/supabase-js")) return "vendor-supabase";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (/[\\/]node_modules[\\/](three|@react-three[\\/]fiber|@react-three[\\/]drei)[\\/]/.test(id)) return "vendor-three";
          if (/[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/.test(id)) return "vendor-maps";
          if (id.includes("@radix-ui")) return "vendor-radix";
          return undefined;
        },
      },
    },
  },
}));
