import { getStore } from "@netlify/blobs";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
const hash = (p, salt) => pbkdf2Sync(p, salt, 150000, 32, "sha256");
const rec = () => getStore("auth").get("admin", { type: "json" });
export const hasPassword = async () => !!(process.env.ADMIN_PASSWORD || (await rec()));
export async function check(req) {
  const p = req.headers.get("x-admin-password") || "";
  if (!p) return false;
  let ok = false;
  const r = await rec();
  if (r) { const a = hash(p, Buffer.from(r.salt, "hex")), b = Buffer.from(r.hash, "hex"); ok = a.length === b.length && timingSafeEqual(a, b); }
  else if (process.env.ADMIN_PASSWORD) ok = p === process.env.ADMIN_PASSWORD;
  if (!ok) await new Promise((s) => setTimeout(s, 900));
  return ok;
}
export async function setPassword(p) {
  const salt = randomBytes(16);
  await getStore("auth").setJSON("admin", { salt: salt.toString("hex"), hash: hash(p, salt).toString("hex") });
}
