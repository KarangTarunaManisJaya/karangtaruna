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
  return db.select({ id: members.id, memberCode: members.memberCode, name: members.name, gender: members.gender, phone: members.phone, email: members.email, address: members.address, position: members.position, status: members.status, joinedAt: members.joinedAt, createdAt: members.createdAt, updatedAt: members.updatedAt }).from(members).orderBy(desc(members.createdAt));
}

function memberRole(position: string) {
  if (position === "Ketua") return "chairman" as const;
  if (position === "Wakil Ketua") return "vice_chair" as const;
  if (position === "Bendahara") return "treasurer" as const;
  if (position === "Sekretaris") return "secretary" as const;
  return "member" as const;
}

export async function listMemberAccounts() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ id: members.id, memberCode: members.memberCode, name: members.name, email: members.email, position: members.position, status: members.status, passwordHash: members.passwordHash }).from(members).orderBy(desc(members.createdAt));
  return rows.map(row => ({ id: row.id, openId: `member:${row.id}`, memberCode: row.memberCode, name: row.name, email: row.email, role: memberRole(row.position), status: row.status, passwordReady: Boolean(row.passwordHash) }));
}

export async function updateMemberPosition(id: number, role: "chairman" | "vice_chair" | "treasurer" | "secretary" | "member") {
  const db = await getDb();
  if (!db) return;
  const position = role === "chairman" ? "Ketua" : role === "vice_chair" ? "Wakil Ketua" : role === "treasurer" ? "Bendahara" : role === "secretary" ? "Sekretaris" : "Anggota";
  await db.update(members).set({ position }).where(eq(members.id, id));
}

export async function getMemberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return result[0];
}

export async function findMemberByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(members).where(eq(members.name, name)).limit(1);
  return result[0];
}

export async function updateMember(id: number, values: { name?: string; gender?: "Laki-laki" | "Perempuan"; position?: "Anggota" | "Bendahara" | "Sekretaris" | "Wakil Ketua" | "Ketua"; phone?: string; passwordHash?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(members).set(values).where(eq(members.id, id));
}

export async function deleteMember(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(members).where(eq(members.id, id));
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

export async function updateDocument(id: number, values: { title?: string; documentCategory?: string; documentNumber?: string; description?: string; recipientName?: string; eventDate?: Date; eventTime?: string; eventLocation?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(documents).set(values).where(eq(documents.id, id));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(documents).where(eq(documents.id, id));
}

export async function updateAsset(id: number, values: { name?: string; category?: string; quantity?: number; condition?: "Baik" | "Perlu perbaikan" | "Rusak"; location?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(assets).set(values).where(eq(assets.id, id));
}

export async function deleteAsset(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(assets).where(eq(assets.id, id));
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

export async function updateFinanceTransaction(id: number, values: { transactionType?: "Pemasukan" | "Pengeluaran"; category?: string; description?: string; amount?: number; transactionDate?: Date; paymentMethod?: "Tunai" | "Transfer" | "QRIS" }) {
  const db = await getDb();
  if (!db) return;
  await db.update(financeTransactions).set(values).where(eq(financeTransactions.id, id));
}

export async function deleteFinanceTransaction(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(financeTransactions).where(eq(financeTransactions.id, id));
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
