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
    hmr: {
      overlay: false // Disable overlay for faster updates
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
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true
    },
    reportCompressedSize: true,
    rollupOptions: {
      external: ['child_process', 'fs', 'path', 'os', '@tauri-apps/api/core'],
      output: {
        manualChunks: (id) => {
          // Aggressive code splitting for super-fast loading
          if (id.includes('node_modules')) {
            // Core React chunks
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            
            // UI library chunks
            if (id.includes('@radix-ui') || id.includes('@headlessui')) {
              return 'vendor-ui';
            }
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-utils';
            }
            
            // Form handling
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            
            // Database & API
            if (id.includes('supabase') || id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            
            // Charts (heavy)
            if (id.includes('recharts') || id.includes('reaviz') || id.includes('d3')) {
              return 'vendor-charts';
            }
            
            // Animation (heavy)
            if (id.includes('framer-motion') || id.includes('react-spring') || id.includes('lottie')) {
              return 'vendor-animation';
            }
            
            // AI & Heavy integrations
            if (id.includes('openai') || id.includes('groq') || id.includes('@anthropic')) {
              return 'vendor-ai';
            }
            
            // Media & Rich content
            if (id.includes('spline') || id.includes('@uiw/react-md-editor') || id.includes('canvas-confetti')) {
              return 'vendor-media';
            }
            
            // Crypto & Blockchain
            if (id.includes('solana') || id.includes('moralis') || id.includes('web3')) {
              return 'vendor-crypto';
            }
            
            // Remaining node_modules
            return 'vendor-misc';
          }
          
          // App-specific chunks by route/feature
          if (id.includes('/pages/admin') || id.includes('/components/admin')) {
            return 'app-admin';
          }
          if (id.includes('/pages/client') || id.includes('/components/client')) {
            return 'app-client';
          }
          if (id.includes('/pages/partnership') || id.includes('/components/partnership')) {
            return 'app-partnership';
          }
          if (id.includes('/pages/projects') || id.includes('/components/projects')) {
            return 'app-projects';
          }
          if (id.includes('/pages/dashboard') || id.includes('/components/dashboard')) {
            return 'app-dashboard';
          }
          if (id.includes('/components/crypto') || id.includes('/pages/crypto')) {
            return 'app-crypto';
          }
          if (id.includes('/services/') && (id.includes('claude') || id.includes('ai') || id.includes('grok'))) {
            return 'app-ai-services';
          }
        },
        
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          
          const extType = assetInfo.name.split('.').pop() || '';
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/img/[name]-[hash][extname]`;
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    sourcemap: mode === 'development',
    commonjsOptions: {
      include: [
        /node_modules/,
        'src/components/ui/sonner.tsx',
        'clsx',
        'tailwind-merge',
        'lucide-react',
      ],
      exclude: ['moralis']
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
