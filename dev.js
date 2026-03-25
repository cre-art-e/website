/**
 * Local static dev server for cre-art-e
 * Run: bun dev
 */
import { join, normalize } from "node:path";

const ROOT = import.meta.dir;
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\//, "");
  const full = normalize(join(ROOT, relative));
  if (!full.startsWith(ROOT)) return null;
  return full;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const path = safePath(new URL(req.url).pathname);
    if (!path) {
      return new Response("Forbidden", { status: 403 });
    }
    const file = Bun.file(path);
    if (!(await file.exists())) {
      return new Response("Not Found", { status: 404 });
    }
    const ext = path.slice(path.lastIndexOf("."));
    const type = MIME[ext] ?? "application/octet-stream";
    return new Response(file, {
      headers: { "Content-Type": type },
    });
  },
});

console.log(`cre-art-e dev server → http://localhost:${server.port}/`);
