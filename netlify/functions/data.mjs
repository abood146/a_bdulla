import { getStore } from "@netlify/blobs";
import { check, hasPassword, setPassword } from "./lib/auth.mjs";
const H = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });

export default async (req) => {
  const store = getStore("portfolio");
  const url = new URL(req.url);
  if (req.method === "GET") {
    if (url.searchParams.has("status")) return J({ setup: !(await hasPassword()) });
    return J((await store.get("data", { type: "json" })) || null);
  }
  if (req.method !== "POST") return J({ error: "method" }, 405);
  const body = await req.json();
  if (body && body.setup !== undefined) {
    if (await hasPassword()) return J({ error: "already" }, 403);
    if (typeof body.setup !== "string" || body.setup.length < 8) return J({ error: "short" }, 400);
    await setPassword(body.setup);
    return J({ ok: true });
  }
  if (!(await check(req))) return J({ error: "unauthorized" }, 401);
  if (body.verify) return J({ ok: true });
  if (body.change !== undefined) {
    if (typeof body.change !== "string" || body.change.length < 8) return J({ error: "short" }, 400);
    await setPassword(body.change);
    return J({ ok: true });
  }
  await store.setJSON("data", body);
  return J({ ok: true });
};
export const config = { path: "/api/data" };
