
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only include componentTagger in development mode
    ...(mode === 'development' ? (() => {
      try {
        const { componentTagger } = require("lovable-tagger");
        return [componentTagger()];
      } catch (e) {
        // Silently fail if lovable-tagger is not available
        return [];
      }
    })() : [])
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Add build configuration to help with deployment
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}));
