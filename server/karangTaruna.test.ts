import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createMemberSession, hashMemberPassword, readMemberSession, verifyMemberPassword } from "./memberAuth";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

function createUserContext(role: "admin" | "treasurer" | "user"): TrpcContext {
  return {
    ...createPublicContext(),
    user: {
      id: 1,
      openId: "finance-user",
      name: "Finance User",
      email: "finance@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };
}

describe("karang taruna workspace procedures", () => {
  it("returns a dashboard summary with the expected counters", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const summary = await caller.dashboard.summary();
    expect(summary).toMatchObject({ memberCount: expect.any(Number), documentCount: expect.any(Number), assetCount: expect.any(Number), activeDocumentCount: expect.any(Number) });
  });

  it("provides a useful member directory when no records exist yet", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const members = await caller.members.list();
    expect(members.length).toBeGreaterThan(0);
    expect(members[0]).toHaveProperty("memberCode");
    expect(members[0]).toHaveProperty("name");
  });

  it("requires an authenticated user to create a member", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.members.create({ name: "Test User", gender: "Laki-laki", position: "Anggota", password: "rahasia123" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns finance totals and protects new transactions", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.finance.summary()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.finance.create({ transactionType: "Pemasukan", category: "Iuran", description: "Iuran test", amount: 100000, transactionDate: new Date(), paymentMethod: "Tunai" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    const adminCaller = appRouter.createCaller(createUserContext("admin"));
    const summary = await adminCaller.finance.summary();
    expect(summary.balance).toBe(summary.income - summary.expense);
    const memberCaller = appRouter.createCaller(createUserContext("user"));
    await expect(memberCaller.finance.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns public activity schedules and community news", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const events = await caller.events.list();
    const news = await caller.news.list();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty("eventDate");
    expect(news.length).toBeGreaterThan(0);
    expect(news[0]).toHaveProperty("excerpt");
  });

  it("restricts role management to administrators", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    await expect(publicCaller.users.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    const treasurerCaller = appRouter.createCaller(createUserContext("treasurer"));
    await expect(treasurerCaller.users.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const adminCaller = appRouter.createCaller(createUserContext("admin"));
    const accounts = await adminCaller.users.list();
    expect(Array.isArray(accounts)).toBe(true);
  });

  it("hashes member passwords and rejects invalid local login", async () => {
    const stored = hashMemberPassword("rahasia123");
    expect(verifyMemberPassword("rahasia123", stored)).toBe(true);
    expect(verifyMemberPassword("salah123", stored)).toBe(false);
    expect(readMemberSession(createMemberSession(42))).toBe(42);
    expect(readMemberSession("42.invalid")).toBeNull();
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.auth.memberLogin({ name: "Tidak Ada", password: "rahasia123" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
