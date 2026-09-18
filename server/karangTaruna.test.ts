import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
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
    await expect(caller.members.create({ name: "Test User", gender: "Laki-laki", position: "Anggota" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns finance totals and protects new transactions", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const summary = await caller.finance.summary();
    const transactions = await caller.finance.list();
    expect(summary.balance).toBe(summary.income - summary.expense);
    expect(transactions.length).toBeGreaterThan(0);
    await expect(caller.finance.create({ transactionType: "Pemasukan", category: "Iuran", description: "Iuran test", amount: 100000, transactionDate: new Date(), paymentMethod: "Tunai" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
