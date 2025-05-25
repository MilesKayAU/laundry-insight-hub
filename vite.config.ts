
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
    // Add build configuration to help with deployment and avoid rollup issues
    outDir: 'dist',
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      // Force use of JS version instead of native binaries
      external: [],
    },
  },
  // Optimize dependencies to avoid native module issues
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@rollup/rollup-linux-x64-gnu']
  },
  // Define to avoid potential issues with process.env
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
