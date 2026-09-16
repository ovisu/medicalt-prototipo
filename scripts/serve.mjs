import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 0);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }

    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
    const filename = path.resolve(root, relativePath);
    const containsPrivatePart = relativePath
      .split(/[\\/]/)
      .some((part) => part.startsWith('.'));

    if (!filename.startsWith(root) || containsPrivatePart) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    const file = await readFile(filename);
    const extension = path.extname(filename);

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : file);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  const address = server.address();
  console.log(`Medicalt: http://127.0.0.1:${address.port}`);
});
