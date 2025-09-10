import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"; // Using plugin-react-swc which is already in the project
import path from "path";
import { apiRoutesPlugin } from "./vite-api-plugin";
import { VitePWA } from 'vite-plugin-pwa';

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
    // No proxy needed - using Supabase directly
  },
  plugins: [
    react(), 
    apiRoutesPlugin(), // Re-enable API plugin for development
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3
            }
          }
        ]
      },
      manifest: {
        name: 'SISO Internal - Offline Productivity Hub',
        short_name: 'SISO Local',
        description: 'Offline-first productivity dashboard that works without internet',
        theme_color: '#ea384c',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'LifeLock Dashboard',
            short_name: 'LifeLock',
            description: 'Open LifeLock productivity dashboard',
            url: '/admin/life-lock',
            icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Analytics',
            short_name: 'Analytics',
            description: 'View productivity analytics',
            url: '/admin/analytics',
            icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Tasks',
            short_name: 'Tasks',
            description: 'Manage tasks offline',
            url: '/admin/tasks',
            icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
          }
        ]
      },
      devOptions: {
        enabled: mode === 'development',
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  
  // M4 Mac Mini Optimizations
  esbuild: {
    target: 'es2022',
    platform: 'neutral',
    keepNames: true
  },
  resolve: {
    alias: [
      { find: "@/ai-first", replacement: path.resolve(__dirname, "./ai-first") },
      { find: "@/internal", replacement: path.resolve(__dirname, "./src/ecosystem/internal") },
      { find: "@/client", replacement: path.resolve(__dirname, "./src/ecosystem/client") },
      { find: "@/partnership", replacement: path.resolve(__dirname, "./src/ecosystem/partnership") },
      { find: "@/shared", replacement: path.resolve(__dirname, "./src/shared") },
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
