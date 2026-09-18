import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { ENV } from "./_core/env";

export const MEMBER_SESSION_COOKIE = "manis_member_session";

export function hashMemberPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyMemberPassword(password: string, stored: string | null | undefined) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expected] = stored.split(":");
  const actual = scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function secret() { return ENV.cookieSecret || "manis-jaya-development-secret"; }
export function createMemberSession(memberId: number) {
  const payload = String(memberId);
  const signature = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}
export function readMemberSession(value?: string) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const memberId = Number(payload);
  return Number.isInteger(memberId) && memberId > 0 ? memberId : null;
}
export function getCookie(header: string | undefined, name: string) {
  const prefix = `${name}=`;
  return header?.split(";").map(item => item.trim()).find(item => item.startsWith(prefix))?.slice(prefix.length);
}
