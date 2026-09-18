import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function MemberLoginPage() {
  const [name, setName] = useState(""); const [password, setPassword] = useState(""); const utils = trpc.useUtils();
  const login = trpc.auth.memberLogin.useMutation({ onSuccess: async result => { await utils.auth.me.invalidate(); toast.success(`Selamat datang, ${result.name}`); window.location.assign("/"); }, onError: error => toast.error(error.message) });
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || password.length < 6) return toast.error("Isi nama anggota dan password minimal 6 karakter"); login.mutate({ name, password }); };
  return <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center"><Card className="w-full max-w-[440px] rounded-[28px] border-0 bg-white shadow-[0_10px_40px_rgba(31,48,36,0.08)]"><CardContent className="p-8 sm:p-10"><div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#243b32] text-[#f2b49b]"><KeyRound className="h-5 w-5" /></div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ed8c6f]">Akses anggota</p><h1 className="font-serif text-3xl font-bold text-[#243b32]">Masuk ke workspace</h1><p className="mt-3 text-sm leading-6 text-[#7c837b]">Gunakan nama anggota dan password yang dibuat oleh pengurus saat menambahkan anggota.</p><form onSubmit={submit} className="mt-7 grid gap-4"><div className="grid gap-2"><Label>Nama anggota</Label><Input value={name} onChange={event => setName(event.target.value)} placeholder="Contoh: Budi Santoso" autoComplete="username" /></div><div className="grid gap-2"><Label>Password</Label><Input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Masukkan password" autoComplete="current-password" /></div><Button type="submit" disabled={login.isPending} className="mt-2 h-11 rounded-xl bg-[#243b32] text-xs font-bold text-white hover:bg-[#1b3028]">{login.isPending ? "Memeriksa..." : "Masuk sebagai anggota"}<ArrowRight className="ml-2 h-4 w-4" /></Button></form><div className="mt-7 flex items-start gap-2 rounded-xl bg-[#f1f3ee] p-3 text-[10px] leading-4 text-[#6e7b70]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#6e8a61]" />Akses otomatis mengikuti jabatan anggota: Ketua, Wakil Ketua, Sekretaris, Bendahara, atau Anggota.</div><Link href="/" className="mt-5 block text-center text-xs font-semibold text-[#7b877c] hover:text-[#243b32]">Kembali ke beranda</Link></CardContent></Card></div>;
}
