import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { assets, documents, events, financeTransactions, members, news } from "../drizzle/schema";
import { deleteAsset, deleteDocument, deleteFinanceTransaction, deleteMember, findMemberByName, getDashboardCounts, getDb, getFinanceSummary, listAssets, listDocuments, listEvents, listFinanceTransactions, listMemberAccounts, listMembers, listNews, updateAsset, updateDocument, updateFinanceTransaction, updateMember, updateMemberPosition } from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";
import { createMemberSession, hashMemberPassword, MEMBER_SESSION_COOKIE, verifyMemberPassword } from "./memberAuth";

const financeProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "treasurer", "chairman", "vice_chair"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Akses keuangan hanya untuk Administrator, Bendahara, Ketua, dan Wakil Ketua." });
  return next();
});
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "chairman"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Pengaturan jabatan hanya dapat diubah Administrator atau Ketua." });
  return next();
});
const documentPrefix: Record<string, string> = { "Undangan anggota": "UND", "Proposal kegiatan": "PRP", Sekretariat: "SKT", Permohonan: "PMH", "Laporan kegiatan": "LAP", Umum: "DOC" };
function createDocumentNumber(category: string) {
  const date = new Date();
  const month = new Intl.DateTimeFormat("id-ID", { month: "2-digit" }).format(date);
  return `${documentPrefix[category] || "DOC"}/${String(date.getFullYear()).slice(-2)}${month}/MJ/${String(Date.now()).slice(-5)}`;
}

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
const fallbackEvents = [
  { id: 1, title: "Rapat koordinasi Festival Kemerdekaan", eventDate: new Date("2026-09-20T16:00:00"), location: "Sekretariat", category: "Rapat", status: "Terjadwal", description: "Finalisasi pembagian tugas dan kebutuhan kegiatan." },
  { id: 2, title: "Kerja bakti lingkungan", eventDate: new Date("2026-09-22T07:00:00"), location: "Lapangan RW 04", category: "Sosial", status: "Terjadwal", description: "Kerja bakti rutin bersama warga." },
  { id: 3, title: "Festival Kemerdekaan Manis Jaya", eventDate: new Date("2026-09-28T19:00:00"), location: "Lapangan desa", category: "Kegiatan", status: "Terjadwal", description: "Malam puncak kegiatan kemerdekaan." },
];
const fallbackNews = [
  { id: 1, title: "Manis Jaya bersiap menyambut Festival Kemerdekaan", excerpt: "Persiapan kegiatan memasuki tahap final dengan kolaborasi pengurus dan warga.", content: "Pengurus Karang Taruna Manis Jaya terus mematangkan persiapan Festival Kemerdekaan.", category: "Kegiatan", publishedAt: new Date("2026-09-17"), authorName: "Rizky Maulana", status: "Terbit" },
  { id: 2, title: "Kerja bakti rutin kembali digelar akhir pekan ini", excerpt: "Ajak warga untuk menjaga lingkungan tetap bersih dan nyaman.", content: "Kegiatan kerja bakti akan dilaksanakan pada Minggu pagi di Lapangan RW 04.", category: "Sosial", publishedAt: new Date("2026-09-14"), authorName: "Siti Nurhaliza", status: "Terbit" },
  { id: 3, title: "Laporan kegiatan olahraga pemuda telah terbit", excerpt: "Dokumentasi dan hasil kegiatan olahraga bulan ini tersedia di workspace.", content: "Laporan kegiatan olahraga pemuda dapat dibaca oleh seluruh anggota.", category: "Berita", publishedAt: new Date("2026-09-10"), authorName: "Nadia Putri", status: "Terbit" },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(MEMBER_SESSION_COOKIE, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    memberLogin: publicProcedure.input(z.object({ name: z.string().min(2), password: z.string().min(6) })).mutation(async ({ input, ctx }) => {
      const member = await findMemberByName(input.name.trim());
      if (!member || member.status !== "Aktif" || !verifyMemberPassword(input.password, member.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Nama anggota atau password salah." });
      ctx.res.cookie(MEMBER_SESSION_COOKIE, createMemberSession(member.id), { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 7 });
      return { success: true, name: member.name } as const;
    }),
  }),
  users: router({
    list: adminProcedure.query(async () => listMemberAccounts()),
    setRole: adminProcedure.input(z.object({ id: z.number().int().positive(), role: z.enum(["chairman", "vice_chair", "treasurer", "secretary", "member"]) })).mutation(async ({ input }) => { await updateMemberPosition(input.id, input.role); return { success: true }; }),
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
    create: protectedProcedure.input(z.object({ name: z.string().trim().min(2), gender: z.enum(["Laki-laki", "Perempuan"]), position: z.enum(["Anggota", "Bendahara", "Sekretaris", "Wakil Ketua", "Ketua"]), password: z.string().min(6), phone: z.string().optional() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: true, demo: true };
      if (await findMemberByName(input.name)) throw new TRPCError({ code: "CONFLICT", message: "Nama anggota sudah terdaftar. Gunakan nama yang berbeda." });
      await db.insert(members).values({ memberCode: `MJ-${Date.now().toString().slice(-4)}`, name: input.name, gender: input.gender, position: input.position, passwordHash: hashMemberPassword(input.password), phone: input.phone });
      return { success: true };
    }),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), name: z.string().trim().min(2), gender: z.enum(["Laki-laki", "Perempuan"]), position: z.enum(["Anggota", "Bendahara", "Sekretaris", "Wakil Ketua", "Ketua"]), password: z.string().min(6).optional(), phone: z.string().optional() })).mutation(async ({ input }) => {
      const existing = await findMemberByName(input.name);
      if (existing && existing.id !== input.id) throw new TRPCError({ code: "CONFLICT", message: "Nama anggota sudah terdaftar. Gunakan nama yang berbeda." });
      const { id, password, ...values } = input;
      await updateMember(id, { ...values, ...(password ? { passwordHash: hashMemberPassword(password) } : {}) });
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await deleteMember(input.id); return { success: true }; }),
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
    create: protectedProcedure.input(z.object({ documentType: z.enum(["Surat", "Proposal", "Laporan"]), documentCategory: z.string().min(2).default("Umum"), title: z.string().min(3), documentNumber: z.string().optional(), description: z.string().optional(), recipientName: z.string().optional(), eventDate: z.date().optional(), eventTime: z.string().optional(), eventLocation: z.string().optional(), signerLeftName: z.string().optional(), signerLeftRole: z.string().optional(), signerRightName: z.string().optional(), signerRightRole: z.string().optional(), copies: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: true, demo: true };
      await db.insert(documents).values({ ...input, documentNumber: input.documentNumber || createDocumentNumber(input.documentCategory), ownerName: ctx.user.name ?? "Pengurus" });
      return { success: true };
    }),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().min(3), documentCategory: z.string().min(2).optional(), documentNumber: z.string().optional(), description: z.string().optional(), recipientName: z.string().optional(), eventDate: z.date().optional(), eventTime: z.string().optional(), eventLocation: z.string().optional(), signerLeftName: z.string().optional(), signerLeftRole: z.string().optional(), signerRightName: z.string().optional(), signerRightRole: z.string().optional(), copies: z.string().optional() })).mutation(async ({ input }) => { const { id, ...values } = input; await updateDocument(id, values); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await deleteDocument(input.id); return { success: true }; }),
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
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), name: z.string().min(2), category: z.string().min(2), quantity: z.number().min(1), condition: z.enum(["Baik", "Perlu perbaikan", "Rusak"]), location: z.string().optional() })).mutation(async ({ input }) => { const { id, ...values } = input; await updateAsset(id, values); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await deleteAsset(input.id); return { success: true }; }),
  }),
  finance: router({
    summary: financeProcedure.query(async () => {
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
    list: financeProcedure.query(async () => {
      try {
        const result = await listFinanceTransactions();
        return result.length ? result : fallbackTransactions;
      } catch (error) {
        console.warn("[Finance] using fallback list", error);
        return fallbackTransactions;
      }
    }),
    create: financeProcedure.input(z.object({ transactionType: z.enum(["Pemasukan", "Pengeluaran"]), category: z.string().min(2), description: z.string().min(3), amount: z.number().min(1), transactionDate: z.date(), paymentMethod: z.enum(["Tunai", "Transfer", "QRIS"]), notes: z.string().optional(), receipt: z.object({ name: z.string(), type: z.string(), data: z.string() }).optional() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: true, demo: true };
      let receiptKey: string | undefined;
      let receiptUrl: string | undefined;
      if (input.receipt) {
        const uploaded = await storagePut(`finance/${ctx.user.id}/${input.receipt.name}`, Buffer.from(input.receipt.data, "base64"), input.receipt.type);
        receiptKey = uploaded.key;
        receiptUrl = uploaded.url;
      }
      await db.insert(financeTransactions).values({ transactionType: input.transactionType, category: input.category, description: input.description, amount: input.amount, transactionDate: input.transactionDate, paymentMethod: input.paymentMethod, notes: input.notes, receiptKey, receiptUrl, receiptName: input.receipt?.name, transactionCode: `TRX-${Date.now().toString().slice(-8)}`, createdBy: ctx.user.name ?? "Pengurus" });
      return { success: true };
    }),
    update: financeProcedure.input(z.object({ id: z.number().int().positive(), transactionType: z.enum(["Pemasukan", "Pengeluaran"]), category: z.string().min(2), description: z.string().min(3), amount: z.number().min(1), transactionDate: z.date(), paymentMethod: z.enum(["Tunai", "Transfer", "QRIS"]) })).mutation(async ({ input }) => { const { id, ...values } = input; await updateFinanceTransaction(id, values); return { success: true }; }),
    delete: financeProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await deleteFinanceTransaction(input.id); return { success: true }; }),
  }),
  events: router({
    list: publicProcedure.query(async () => { try { const result = await listEvents(); return result.length ? result : fallbackEvents; } catch { return fallbackEvents; } }),
    create: protectedProcedure.input(z.object({ title: z.string().min(3), eventDate: z.date(), location: z.string().optional(), category: z.string().min(2), description: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) return { success: true, demo: true }; await db.insert(events).values({ ...input, createdBy: ctx.user.name ?? "Pengurus" }); return { success: true }; }),
  }),
  news: router({
    list: publicProcedure.query(async () => { try { const result = await listNews(); return result.length ? result : fallbackNews; } catch { return fallbackNews; } }),
    create: protectedProcedure.input(z.object({ title: z.string().min(3), excerpt: z.string().min(3), content: z.string().min(3), category: z.string().min(2) })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) return { success: true, demo: true }; await db.insert(news).values({ ...input, authorName: ctx.user.name ?? "Pengurus" }); return { success: true }; }),
  }),
});

export type AppRouter = typeof appRouter;
