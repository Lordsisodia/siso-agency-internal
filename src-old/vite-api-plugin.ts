/**
 * Vite Plugin to serve pages/api routes like Next.js
 * This allows npm run dev to work without needing a separate server
 */

import { Plugin } from 'vite';
import path from 'path';
import { pathToFileURL } from 'url';

export function apiRoutesPlugin(): Plugin {
  return {
    name: 'api-routes',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const apiPath = req.url?.split('?')[0];
          if (!apiPath) {
            return next();
          }
          
          const filePath = path.resolve(process.cwd(), `api${apiPath}.js`);
          
          try {
            // Use import() instead of require for proper ESM support
            const fileUrl = pathToFileURL(filePath).href;
            const module = await import(fileUrl + '?t=' + Date.now()); // Cache busting
            
            if (module.default && typeof module.default === 'function') {
              // Set up proper Node.js-like req/res objects
              const body = await new Promise((resolve) => {
                let data = '';
                req.on('data', (chunk: any) => {
                  data += chunk;
                });
                req.on('end', () => {
                  try {
                    resolve(data ? JSON.parse(data) : {});
                  } catch {
                    resolve({});
                  }
                });
              });

              const requestObj = {
                method: req.method,
                url: req.url,
                query: Object.fromEntries(new URL(req.url || '', 'http://localhost').searchParams),
                body,
                headers: req.headers
              };

              const responseObj = {
                setHeader: (name: string, value: string) => res.setHeader(name, value),
                status: (code: number) => {
                  res.statusCode = code;
                  return responseObj;
                },
                json: (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                },
                end: (data?: any) => res.end(data)
              };

              await module.default(requestObj, responseObj);
              return;
            }
          } catch (error) {
            console.error('Error loading API route:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
            return;
          }
          
          next();
        } catch (error) {
          console.error('API middleware error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    }
  };
}