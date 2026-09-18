import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { assets, documents, events, financeTransactions, InsertUser, members, news, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    const value = user[field];
    if (value === undefined) return;
    values[field] = value ?? null;
    updateSet[field] = value ?? null;
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }
  values.lastSignedIn ??= new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, openId: users.openId, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(id: number, role: "user" | "admin" | "chairman" | "vice_chair" | "treasurer" | "secretary" | "member") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, id));
}

export async function listMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).orderBy(desc(members.createdAt));
}

export async function listDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).orderBy(desc(documents.createdAt));
}

export async function listAssets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assets).orderBy(desc(assets.createdAt));
}

export async function getDashboardCounts() {
  const [memberRows, documentRows, assetRows] = await Promise.all([listMembers(), listDocuments(), listAssets()]);
  return {
    memberCount: memberRows.length,
    documentCount: documentRows.length,
    assetCount: assetRows.reduce((total, asset) => total + asset.quantity, 0),
    activeDocumentCount: documentRows.filter(document => document.status === "Diproses").length,
  };
}

export async function listFinanceTransactions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(financeTransactions).orderBy(desc(financeTransactions.transactionDate));
}

export async function getFinanceSummary() {
  const rows = await listFinanceTransactions();
  return {
    income: rows.filter(row => row.transactionType === "Pemasukan").reduce((total, row) => total + row.amount, 0),
    expense: rows.filter(row => row.transactionType === "Pengeluaran").reduce((total, row) => total + row.amount, 0),
    transactionCount: rows.length,
    pendingCount: rows.filter(row => row.status === "Menunggu").length,
  };
}

export async function listEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(desc(events.eventDate));
}

export async function listNews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(news).orderBy(desc(news.publishedAt));
}
