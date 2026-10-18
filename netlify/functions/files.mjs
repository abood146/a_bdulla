import { getStore } from "@netlify/blobs";
import { check } from "./lib/auth.mjs";
export default async (req) => {
  const store = getStore("files");
  if (req.method === "GET") {
    const id = new URL(req.url).pathname.split("/").pop();
    const r = await store.getWithMetadata(id, { type: "arrayBuffer" });
    if (!r) return new Response("not found", { status: 404 });
    return new Response(r.data, { headers: { "content-type": r.metadata?.type || "application/octet-stream", "cache-control": "public, max-age=31536000, immutable" } });
  }
  if (!(await check(req))) return new Response("unauthorized", { status: 401 });
  const type = req.headers.get("content-type") || "application/octet-stream";
  if (!/^(image\/|application\/pdf)/.test(type)) return new Response("type", { status: 400 });
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  await store.set(id, await req.arrayBuffer(), { metadata: { type } });
  return new Response(JSON.stringify({ url: "/api/file/" + id }), { headers: { "content-type": "application/json" } });
};
export const config = { path: ["/api/upload", "/api/file/*"] };
