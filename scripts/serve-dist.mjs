import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT ?? 4322);
const types = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.xml': 'application/xml',
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? '/', 'http://localhost').pathname,
    );
    const relative = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const file = resolve(root, `.${relative}`);
    if (file !== root && !file.startsWith(`${root}${sep}`)) throw new Error('Invalid path');
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving dist at http://127.0.0.1:${port}`);
});
