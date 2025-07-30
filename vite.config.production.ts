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
        // Simpler chunking strategy - keep React ecosystem together
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Core dependencies in one chunk to avoid context issues
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('react-router') ||
                id.includes('framer-motion') ||
                id.includes('@radix-ui')) {
              return 'vendor';
            }
            
            // Supabase in separate chunk
            if (id.includes('supabase')) {
              return 'supabase';
            }
            
            // All other dependencies
            return 'libs';
          }
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