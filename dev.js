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
  const trimmed =
    decoded === "/" || decoded === ""
      ? "index.html"
      : decoded.replace(/^\//, "").replace(/\/$/, "");
  const full = normalize(join(ROOT, trimmed));
  if (!full.startsWith(ROOT)) return null;
  return full;
}

/** Resolve URL to an existing file: direct path, then `{dir}/index.html`, then `{name}.html`. */
async function resolveStaticPath(urlPath) {
  const base = safePath(urlPath);
  if (!base) return null;

  const tryExists = async (p) => {
    const f = Bun.file(p);
    if (await f.exists()) return p;
    return null;
  };

  if (await tryExists(base)) return base;

  const asIndex = join(base, "index.html");
  if (await tryExists(asIndex)) return asIndex;

  if (!base.endsWith(".html")) {
    const asHtml = `${base}.html`;
    if (await tryExists(asHtml)) return asHtml;
  }

  return null;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const path = await resolveStaticPath(new URL(req.url).pathname);
    if (!path) {
      return new Response("Not Found", { status: 404 });
    }
    const file = Bun.file(path);
    const ext = path.slice(path.lastIndexOf("."));
    const type = MIME[ext] ?? "application/octet-stream";
    return new Response(file, {
      headers: { "Content-Type": type },
    });
  },
});

console.log(`cre-art-e dev server → http://localhost:${server.port}/`);
