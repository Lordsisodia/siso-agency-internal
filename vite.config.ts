import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"; // Using plugin-react-swc which is already in the project
import path from "path";
import { apiRoutesPlugin } from "./src/vite-api-plugin";
import { VitePWA } from 'vite-plugin-pwa';

// [Analysis] Implementing granular code splitting for optimal chunk sizes
// [Plan] Monitor performance impact and adjust splits if needed
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Allow network access
    port: 4249, // Use alternate dev port to avoid clash with other instance
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
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest,txt,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [/^\/lovable-uploads\//], // Don't cache lovable-uploads paths
        // Exclude lovable-uploads from being cached
        globIgnores: ['**/lovable-uploads/**'],
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
            urlPattern: ({ request, url }) => {
              // Skip lovable-uploads paths to prevent 404 spam
              if (url.pathname.includes('/lovable-uploads/')) return false;
              return request.destination === 'image';
            },
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
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
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
            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Analytics',
            short_name: 'Analytics',
            description: 'View productivity analytics',
            url: '/admin/analytics',
            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Tasks',
            short_name: 'Tasks',
            description: 'Manage tasks offline',
            url: '/admin/tasks',
            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
          }
        ]
      },
      devOptions: {
        enabled: false, // Disable service worker in development to prevent console spam
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  
  // M4 Mac Mini Optimizations
  esbuild: {
    target: 'es2022',
    platform: 'neutral',
    keepNames: true,
    // Drop console logs in production to reduce spam and improve performance
    drop: mode === 'production' ? ['console', 'debugger'] : []
  },
  resolve: {
    alias: [
      { find: "@/ai-first", replacement: path.resolve(__dirname, "./ai-first") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@app", replacement: path.resolve(__dirname, "./src/app") },
      { find: "@domains", replacement: path.resolve(__dirname, "./src/domains") },
      { find: "@services", replacement: path.resolve(__dirname, "./src/services") },
      { find: "@components", replacement: path.resolve(__dirname, "./src/components") },
      { find: "@lib", replacement: path.resolve(__dirname, "./src/lib") },
      { find: "@stores", replacement: path.resolve(__dirname, "./src/lib/stores") },
      { find: "@scripts", replacement: path.resolve(__dirname, "./src/lib/scripts") },
      { find: "@providers", replacement: path.resolve(__dirname, "./src/providers") },
      { find: "../../generated/prisma", replacement: path.resolve(__dirname, "./generated/prisma") },
    ]
  },
  build: {
    target: mode === 'production' ? 'es2015' : 'esnext',
    minify: 'esbuild',
    cssMinify: false,
    cssCodeSplit: false, // Prevent CSS splitting issues
    sourcemap: mode === 'development',
    // Reduce memory usage for Vercel builds
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: mode === 'development' ? ['child_process', 'fs', 'path', 'os', '@tauri-apps/api/core'] : [],
      output: mode === 'production' ? {
        // Advanced chunking for optimal bundle sizes
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-slot', 'lucide-react'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'animations': ['framer-motion'],
          'utils': ['date-fns', 'clsx', 'tailwind-merge']
        },
        // Dynamic chunking for large components
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId?.includes('ResourcesPage')) return 'resources-[hash].js'
          if (facadeModuleId?.includes('UserFlow')) return 'userflow-[hash].js'
          if (facadeModuleId?.includes('incident-report')) return 'reports-[hash].js'
          if (facadeModuleId?.includes('AdminLifeLock')) return 'lifelock-[hash].js'
          if (facadeModuleId?.includes('AdminTasks')) return 'tasks-[hash].js'
          return 'chunk-[hash].js'
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
    exclude: ['moralis', 'zhipuai-sdk-nodejs-v4', 'jsonwebtoken'],
    // M4 Optimizations
    esbuildOptions: {
      target: 'es2022',
      platform: 'neutral',
      keepNames: true,
      // Also drop console in dev dependencies pre-bundling
      drop: mode === 'production' ? ['console', 'debugger'] : []
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
