import { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';

// Simple API plugin for Vite development server
// Serves API routes from /api and /src/pages/api directories
export function apiRoutesPlugin(): Plugin {
  return {
    name: 'api-routes-plugin',
    configureServer(server) {
      // Handle API routes for development
      server.middlewares.use('/api', async (req, res, next) => {
        const url = req.url || '';
        const method = req.method || 'GET';
        
        // Skip if not an API call or if it's a static file request
        if (url.includes('.') && !url.endsWith('.js') && !url.endsWith('.ts')) {
          return next();
        }

        // Clean URL path for route matching
        let routePath = url.replace(/^\/api/, '').replace(/\?.*$/, '');
        if (routePath === '') routePath = '/';
        if (!routePath.startsWith('/')) routePath = '/' + routePath;

        // Development API route logging disabled to pass ESLint

        // Try to find matching API route files
        const possiblePaths = [
          path.join(process.cwd(), 'api', routePath + '.js'),
          path.join(process.cwd(), 'src/pages/api', routePath + '.ts'),
          path.join(process.cwd(), 'src/pages/api', routePath + '.js'),
          path.join(process.cwd(), 'api', routePath.replace(/\/$/, '') + '.js'),
          path.join(process.cwd(), 'src/pages/api', routePath.replace(/\/$/, '') + '.ts'),
        ];

        // Check for dynamic routes (e.g., [id])
        if (!fs.existsSync(possiblePaths[0]) && !fs.existsSync(possiblePaths[1])) {
          const pathParts = routePath.split('/').filter(Boolean);
          if (pathParts.length > 0) {
            // Try with parent directory + filename pattern
            const parentPath = pathParts.slice(0, -1).join('/');
            const dynamicPath = path.join(process.cwd(), 'src/pages/api', parentPath, `[${pathParts[pathParts.length - 1]}].ts`);
            possiblePaths.push(dynamicPath);
          }
        }

        // Find existing route file
        const existingRoute = possiblePaths.find(p => fs.existsSync(p));
        
        if (existingRoute) {
          try {
            // For development, just provide a basic response
            // indicating the route exists but would need proper server-side handling
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({
              message: `API route ${routePath} found at ${existingRoute}`,
              note: 'This is a development placeholder. Real API handling requires server-side execution.',
              method,
              path: routePath,
              timestamp: new Date().toISOString()
            }));
            return;
          } catch (error) {
            console.error(`API Error handling route ${routePath}:`, error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal server error' }));
            return;
          }
        }

        // Route not found
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(404);
        res.end(JSON.stringify({
          error: 'API route not found',
          path: routePath,
          method,
          searchedPaths: possiblePaths,
          timestamp: new Date().toISOString()
        }));
      });
    }
  };
}