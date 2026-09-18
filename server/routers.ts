import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { assets, documents, financeTransactions, members } from "../drizzle/schema";
import { getDashboardCounts, getDb, getFinanceSummary, listAssets, listDocuments, listFinanceTransactions, listMembers } from "./db";
import { z } from "zod";

const fallbackMembers = [
  { id: 1, memberCode: "MJ-001", name: "Rizky Maulana", gender: "Laki-laki", position: "Ketua", status: "Aktif", phone: "0812 3456 7890", address: "Dusun Manis Jaya" },
  { id: 2, memberCode: "MJ-002", name: "Siti Nurhaliza", gender: "Perempuan", position: "Sekretaris", status: "Aktif", phone: "0813 2288 1940", address: "Dusun Manis Jaya" },
  { id: 3, memberCode: "MJ-003", name: "Andi Pratama", gender: "Laki-laki", position: "Bendahara", status: "Aktif", phone: "0821 9034 1122", address: "Dusun Manis Jaya" },
  { id: 4, memberCode: "MJ-004", name: "Nadia Putri", gender: "Perempuan", position: "Koordinator Kegiatan", status: "Aktif", phone: "0857 1100 2931", address: "Dusun Manis Jaya" },
  { id: 5, memberCode: "MJ-005", name: "Fajar Hidayat", gender: "Laki-laki", position: "Anggota", status: "Aktif", phone: "0896 4432 1108", address: "Dusun Manis Jaya" },
];
const fallbackDocuments = [
  { id: 1, documentType: "Proposal", title: "Festival Kemerdekaan Manis Jaya", documentNumber: "PRP/006/MJ/IX/2026", status: "Diproses", ownerName: "Nadia Putri", createdAt: new Date("2026-09-14") },
  { id: 2, documentType: "Surat", title: "Surat Permohonan Fasilitas Lapangan", documentNumber: "SKT/014/MJ/IX/2026", status: "Disetujui", ownerName: "Siti Nurhaliza", createdAt: new Date("2026-09-12") },
  { id: 3, documentType: "Laporan", title: "Laporan Kegiatan Kerja Bakti", documentNumber: "LAP/003/MJ/IX/2026", status: "Arsip", ownerName: "Rizky Maulana", createdAt: new Date("2026-09-09") },
];
const fallbackAssets = [
  { id: 1, name: "Tenda lipat 3x3", category: "Perlengkapan acara", quantity: 4, condition: "Baik", location: "Sekretariat" },
  { id: 2, name: "Sound system portable", category: "Elektronik", quantity: 1, condition: "Perlu perbaikan", location: "Sekretariat" },
  { id: 3, name: "Kursi plastik", category: "Perlengkapan acara", quantity: 80, condition: "Baik", location: "Gudang RW 04" },
];
const fallbackTransactions = [
  { id: 1, transactionCode: "TRX-240918-01", transactionType: "Pemasukan", category: "Iuran anggota", description: "Iuran rutin September 2026", amount: 2500000, transactionDate: new Date("2026-09-05"), paymentMethod: "Transfer", status: "Terverifikasi", createdBy: "Andi Pratama" },
  { id: 2, transactionCode: "TRX-240916-02", transactionType: "Pengeluaran", category: "Kegiatan", description: "Pembelian konsumsi rapat koordinasi", amount: 475000, transactionDate: new Date("2026-09-16"), paymentMethod: "Tunai", status: "Terverifikasi", createdBy: "Andi Pratama" },
  { id: 3, transactionCode: "TRX-240912-03", transactionType: "Pemasukan", category: "Bantuan desa", description: "Dukungan kegiatan Festival Kemerdekaan", amount: 5000000, transactionDate: new Date("2026-09-12"), paymentMethod: "Transfer", status: "Terverifikasi", createdBy: "Rizky Maulana" },
  { id: 4, transactionCode: "TRX-240910-04", transactionType: "Pengeluaran", category: "Operasional", description: "Transportasi koordinasi lapangan", amount: 350000, transactionDate: new Date("2026-09-10"), paymentMethod: "QRIS", status: "Menunggu", createdBy: "Nadia Putri" },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dashboard: router({
    summary: publicProcedure.query(async () => {
      try {
        const result = await getDashboardCounts();
        if (result.memberCount || result.documentCount || result.assetCount) return result;
      } catch (error) {
        console.warn("[Dashboard] using fallback summary", error);
      }
      return { memberCount: 128, documentCount: 24, assetCount: 86, activeDocumentCount: 6 };
    }),
  }),
  members: router({
    list: publicProcedure.query(async () => {
      try {
        const result = await listMembers();
        return result.length ? result : fallbackMembers;
      } catch (error) {
        console.warn("[Members] using fallback list", error);
        return fallbackMembers;
      }
    }),
    create: protectedProcedure.input(z.object({ name: z.string().min(2), gender: z.enum(["Laki-laki", "Perempuan"]), position: z.string().default("Anggota"), phone: z.string().optional() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: true, demo: true };
      await db.insert(members).values({ memberCode: `MJ-${Date.now().toString().slice(-4)}`, name: input.name, gender: input.gender, position: input.position, phone: input.phone });
      return { success: true };
    }),
  }),
  documents: router({
    list: publicProcedure.query(async () => {
      try {
        const result = await listDocuments();
        return result.length ? result : fallbackDocuments;
      } catch (error) {
        console.warn("[Documents] using fallback list", error);
        return fallbackDocuments;
      }
    }),
    create: protectedProcedure.input(z.object({ documentType: z.enum(["Surat", "Proposal", "Laporan"]), title: z.string().min(3), documentNumber: z.string().optional(), description: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: true, demo: true };
      await db.insert(documents).values({ ...input, ownerName: ctx.user.name ?? "Pengurus" });
      return { success: true };
    }),
  }),
  assets: router({
    list: publicProcedure.query(async () => {
      try {
        const result = await listAssets();
        return result.length ? result : fallbackAssets;
      } catch (error) {
        console.warn("[Assets] using fallback list", error);
        return fallbackAssets;
      }
    }),
    create: protectedProcedure.input(z.object({ name: z.string().min(2), category: z.string().min(2), quantity: z.number().min(1), condition: z.enum(["Baik", "Perlu perbaikan", "Rusak"]), location: z.string().optional() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: true, demo: true };
      await db.insert(assets).values(input);
      return { success: true };
    }),
  }),
  finance: router({
    summary: publicProcedure.query(async () => {
      try {
        const result = await getFinanceSummary();
        if (result.transactionCount) return { ...result, balance: result.income - result.expense };
      } catch (error) {
        console.warn("[Finance] using fallback summary", error);
      }
      const income = fallbackTransactions.filter(row => row.transactionType === "Pemasukan").reduce((total, row) => total + row.amount, 0);
      const expense = fallbackTransactions.filter(row => row.transactionType === "Pengeluaran").reduce((total, row) => total + row.amount, 0);
      return { income, expense, balance: income - expense, transactionCount: fallbackTransactions.length, pendingCount: 1 };
    }),
    list: publicProcedure.query(async () => {
      try {
        const result = await listFinanceTransactions();
        return result.length ? result : fallbackTransactions;
      } catch (error) {
        console.warn("[Finance] using fallback list", error);
        return fallbackTransactions;
      }
    }),
    create: protectedProcedure.input(z.object({ transactionType: z.enum(["Pemasukan", "Pengeluaran"]), category: z.string().min(2), description: z.string().min(3), amount: z.number().min(1), transactionDate: z.date(), paymentMethod: z.enum(["Tunai", "Transfer", "QRIS"]), notes: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: true, demo: true };
      await db.insert(financeTransactions).values({ ...input, transactionCode: `TRX-${Date.now().toString().slice(-8)}`, createdBy: ctx.user.name ?? "Pengurus" });
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
