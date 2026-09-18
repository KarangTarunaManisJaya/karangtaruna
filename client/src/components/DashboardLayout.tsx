import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { cn } from "@/lib/utils";
import { Archive, BarChart3, DollarSign, FileText, FolderKanban, LayoutDashboard, LogIn, LogOut, Menu, Package, Settings2, ShieldCheck, Users, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";

const menuGroups = [
  { label: "Workspace", items: [
    { icon: LayoutDashboard, label: "Ringkasan", path: "/" },
    { icon: Users, label: "Anggota", path: "/members" },
    { icon: FileText, label: "Surat menyurat", path: "/letters" },
    { icon: FolderKanban, label: "Proposal", path: "/proposals" },
    { icon: BarChart3, label: "Laporan", path: "/reports" },
    { icon: Package, label: "Aset organisasi", path: "/assets" },
    { icon: DollarSign, label: "Keuangan", path: "/finance" },
  ]},
  { label: "Pengaturan", items: [
    { icon: ShieldCheck, label: "Akses pengguna", path: "/users" },
    { icon: Settings2, label: "Pengaturan umum", path: "/settings" },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const displayName = user?.name || "Pengurus Manis Jaya";
  const initials = displayName.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <DashboardSidebar displayName={displayName} initials={initials} userEmail={user?.email || "Mode pratinjau"} onLogout={logout} />
      <SidebarInset className="bg-[#f8f8f6]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e8e7e2] bg-[#f8f8f6]/90 px-5 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-9 w-9 rounded-xl text-[#5f635d] hover:bg-white hover:text-[#171a18]" />
            <div className="hidden h-5 w-px bg-[#deddd8] sm:block" />
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8f88] sm:block">Manis Jaya / Workspace</span>
          </div>
          <div className="flex items-center gap-2.5">
            {!user && <Button size="sm" onClick={() => startLogin()} className="h-9 rounded-xl bg-[#243b32] px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-[#1b3028]"><LogIn className="mr-2 h-3.5 w-3.5" />Masuk</Button>}
            <div className="hidden h-8 w-px bg-[#deddd8] md:block" />
            <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-[0_2px_12px_rgba(24,35,27,0.04)]">
              <div className="h-7 w-7 rounded-full bg-[#f2b49b] text-center text-[10px] font-bold leading-7 text-[#5b2e22]">{initials}</div>
              <span className="hidden max-w-36 truncate pr-1 text-xs font-semibold text-[#293029] md:block">{displayName}</span>
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function DashboardSidebar({ displayName, initials, userEmail, onLogout }: { displayName: string; initials: string; userEmail: string; onLogout: () => void }) {
  const [location, setLocation] = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = (path: string) => { setLocation(path); if (isMobile) setOpenMobile(false); };
  return (
    <Sidebar collapsible="icon" className="border-r border-[#e6e5df] bg-[#f1f2ec]">
      <SidebarHeader className="h-20 justify-center px-3">
        <div className={cn("flex items-center gap-3 px-2", collapsed && "justify-center px-0")}>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#243b32] text-white shadow-sm"><span className="font-serif text-lg italic">M</span><span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#f1f2ec] bg-[#ed8c6f]" /></div>
          {!collapsed && <div className="min-w-0"><p className="truncate text-sm font-bold tracking-tight text-[#243b32]">Manis Jaya</p><p className="truncate text-[10px] uppercase tracking-[0.14em] text-[#8c9389]">Karang Taruna</p></div>}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        {menuGroups.map(group => <div key={group.label} className="mb-6"><p className={cn("px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9da39c]", collapsed && "text-center text-[8px]")}>{collapsed ? "•" : group.label}</p><SidebarMenu>{group.items.map(item => { const active = location === item.path; return <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={active} onClick={() => navigate(item.path)} tooltip={item.label} className={cn("h-10 rounded-xl px-3 text-[#697169] hover:bg-white/80 hover:text-[#243b32]", active && "bg-white font-semibold text-[#243b32] shadow-[0_3px_12px_rgba(36,59,50,0.07)]") }><item.icon className={cn("h-[17px] w-[17px]", active && "text-[#ed8c6f]")} /><span>{item.label}</span>{item.path === "/letters" && <span className="ml-auto rounded-full bg-[#f8d8cc] px-1.5 py-0.5 text-[9px] font-bold text-[#9b523c]">3</span>}</SidebarMenuButton></SidebarMenuItem>; })}</SidebarMenu></div>)}
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && <div className="mb-3 rounded-2xl bg-[#243b32] p-3.5 text-white"><div className="mb-2 flex items-center gap-2"><Archive className="h-4 w-4 text-[#f2b49b]" /><span className="text-xs font-semibold">Ruang kolaborasi</span></div><p className="text-[11px] leading-4 text-white/60">Kelola kegiatan desa dengan lebih rapi dan transparan.</p></div>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button className={cn("flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/80", collapsed && "justify-center px-0")}><Avatar className="h-8 w-8 border-2 border-white"><AvatarFallback className="bg-[#f2b49b] text-[10px] font-bold text-[#5b2e22]">{initials}</AvatarFallback></Avatar>{!collapsed && <div className="min-w-0"><p className="truncate text-xs font-bold text-[#354037]">{displayName}</p><p className="truncate text-[10px] text-[#8b928a]">{userEmail}</p></div>}</button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl"><DropdownMenuItem onClick={onLogout} className="cursor-pointer text-xs"><LogOut className="mr-2 h-4 w-4" />Keluar dari sesi</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
