import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"; // Using plugin-react-swc which is already in the project
import path from "path";

// [Analysis] Implementing granular code splitting for optimal chunk sizes
// [Plan] Monitor performance impact and adjust splits if needed
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Allow network access
    port: 5173, // Use Vite default port to match Tauri config
    strictPort: false, // Allow fallback to other ports if needed
    open: false, // Don't auto-open browser
    // https: true, // Enable HTTPS for voice recognition (commented out - see alternative solutions below)
    hmr: {
      overlay: false // Disable overlay for faster updates
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    fs: {
      strict: false, // Allow serving files from outside root
      // Exclude problematic directories from dependency scanning
      deny: [
        '**/storage/**',
        '**/src-tauri/target/**',
        '**/projects/**',
        '**/dist-*/**',
        '**/*.app/**'
      ]
    },
    // Proxy API calls to backend server
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [react()],
  
  // M4 Mac Mini Optimizations
  esbuild: {
    target: 'es2022',
    platform: 'neutral',
    keepNames: true
  },
  resolve: {
    alias: [
      { find: "@/ai-first", replacement: path.resolve(__dirname, "./ai-first") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "../../generated/prisma", replacement: path.resolve(__dirname, "./generated/prisma") },
    ]
  },
  build: {
    target: mode === 'production' ? 'es2015' : 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: false, // Prevent CSS splitting issues
    sourcemap: mode === 'development',
    rollupOptions: {
      external: mode === 'development' ? ['child_process', 'fs', 'path', 'os', '@tauri-apps/api/core'] : [],
      output: mode === 'production' ? {
        // Simple chunking for production to avoid React context issues
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-slot', 'lucide-react'],
          'supabase': ['@supabase/supabase-js']
        }
      } : {}
    }
  },
  
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      'framer-motion', // Pre-bundle framer-motion to avoid context issues
    ],
    exclude: ['moralis'],
    // M4 Optimizations
    esbuildOptions: {
      target: 'es2022',
      platform: 'neutral',
      keepNames: true
    },
    // Pre-bundle heavy dependencies
    force: mode === 'development'
  },
  
  // Enhanced caching for M4 performance
  cacheDir: './.vite-cache',
  
  experimental: {
    renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
      if (hostType === 'html') {
        return { relative: true };
      }
      return { relative: true };
    },
  }
}));
