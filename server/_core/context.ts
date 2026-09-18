import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getMemberById } from "../db";
import { getCookie, MEMBER_SESSION_COOKIE, readMemberSession } from "../memberAuth";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function roleFromPosition(position: string): User["role"] {
  if (position === "Ketua") return "chairman";
  if (position === "Wakil Ketua") return "vice_chair";
  if (position === "Bendahara") return "treasurer";
  if (position === "Sekretaris") return "secretary";
  return "member";
}

async function authenticateMember(req: CreateExpressContextOptions["req"]): Promise<User | null> {
  const memberId = readMemberSession(getCookie(req.headers.cookie, MEMBER_SESSION_COOKIE));
  if (!memberId) return null;
  const member = await getMemberById(memberId);
  if (!member || member.status !== "Aktif") return null;
  return {
    id: member.id,
    openId: `member:${member.id}`,
    name: member.name,
    email: member.email,
    loginMethod: "member-password",
    role: roleFromPosition(member.position),
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    lastSignedIn: new Date(),
  };
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try { user = await sdk.authenticateRequest(opts.req); } catch { user = null; }
  if (!user) {
    try { user = await authenticateMember(opts.req); } catch { user = null; }
  }
  return { user, req: opts.req, res: opts.res };
}
