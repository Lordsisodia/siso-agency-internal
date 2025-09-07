import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Simplified production config to fix Vercel deployment
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  
  build: {
    target: 'es2015',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep React in main chunk to avoid context issues
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-slot', 'lucide-react'],
          'router': ['react-router-dom'],
          'supabase': ['@supabase/supabase-js', '@supabase/auth-helpers-react']
        }
      }
    }
  },
  
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      'clsx',
      'tailwind-merge',
      'lucide-react',
    ]
  }
});