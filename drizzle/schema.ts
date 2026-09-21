import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "chairman", "vice_chair", "treasurer", "secretary", "member"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const members = mysqlTable("members", {
  id: int("id").autoincrement().primaryKey(),
  memberCode: varchar("memberCode", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  gender: mysqlEnum("gender", ["Laki-laki", "Perempuan"]).notNull(),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  position: varchar("position", { length: 80 }).default("Anggota").notNull(),
  passwordHash: varchar("passwordHash", { length: 180 }),
  status: mysqlEnum("status", ["Aktif", "Tidak aktif"]).default("Aktif").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  documentType: mysqlEnum("documentType", ["Surat", "Proposal", "Laporan"]).notNull(),
  documentCategory: varchar("documentCategory", { length: 80 }).default("Umum").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  documentNumber: varchar("documentNumber", { length: 80 }),
  status: mysqlEnum("status", ["Draft", "Diproses", "Disetujui", "Arsip"]).default("Draft").notNull(),
  description: text("description"),
  recipientName: varchar("recipientName", { length: 180 }),
  eventDate: timestamp("eventDate"),
  eventTime: varchar("eventTime", { length: 40 }),
  eventLocation: varchar("eventLocation", { length: 180 }),
  signerLeftName: varchar("signerLeftName", { length: 160 }),
  signerLeftRole: varchar("signerLeftRole", { length: 100 }),
  signerRightName: varchar("signerRightName", { length: 160 }),
  signerRightRole: varchar("signerRightRole", { length: 100 }),
  copies: text("copies"),
  ownerName: varchar("ownerName", { length: 160 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  condition: mysqlEnum("condition", ["Baik", "Perlu perbaikan", "Rusak"]).default("Baik").notNull(),
  location: varchar("location", { length: 120 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const financeTransactions = mysqlTable("financeTransactions", {
  id: int("id").autoincrement().primaryKey(),
  transactionCode: varchar("transactionCode", { length: 40 }).notNull().unique(),
  transactionType: mysqlEnum("transactionType", ["Pemasukan", "Pengeluaran"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 240 }).notNull(),
  amount: int("amount").notNull(),
  transactionDate: timestamp("transactionDate").defaultNow().notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["Tunai", "Transfer", "QRIS"]).default("Tunai").notNull(),
  status: mysqlEnum("status", ["Terverifikasi", "Menunggu"]).default("Terverifikasi").notNull(),
  createdBy: varchar("createdBy", { length: 160 }),
  notes: text("notes"),
  receiptKey: varchar("receiptKey", { length: 255 }),
  receiptUrl: varchar("receiptUrl", { length: 500 }),
  receiptName: varchar("receiptName", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  location: varchar("location", { length: 160 }),
  category: varchar("category", { length: 80 }).default("Kegiatan").notNull(),
  status: mysqlEnum("status", ["Terjadwal", "Selesai", "Dibatalkan"]).default("Terjadwal").notNull(),
  description: text("description"),
  createdBy: varchar("createdBy", { length: 160 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  excerpt: varchar("excerpt", { length: 300 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 80 }).default("Kegiatan").notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  authorName: varchar("authorName", { length: 160 }),
  status: mysqlEnum("status", ["Terbit", "Draft"]).default("Terbit").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;
export type FinanceTransaction = typeof financeTransactions.$inferSelect;
export type InsertFinanceTransaction = typeof financeTransactions.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;
