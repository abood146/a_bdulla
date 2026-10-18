import { getStore } from "@netlify/blobs";
const H = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });

export default async (req) => {
  const store = getStore("portfolio");
  if (req.method === "GET") return J((await store.get("data", { type: "json" })) || null);
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass || req.headers.get("x-admin-password") !== pass) return J({ error: "unauthorized" }, 401);
  if (req.method === "POST") {
    const body = await req.json();
    if (body && body.verify) return J({ ok: true });
    await store.setJSON("data", body);
    return J({ ok: true });
  }
  return J({ error: "method" }, 405);
};
export const config = { path: "/api/data" };
