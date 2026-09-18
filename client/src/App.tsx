import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home, { AssetsPage, DocumentsPage, MembersPage, SettingsPage, UsersPage } from "./pages/Home";
import FinancePage from "./pages/Finance";
import AccessPage from "./pages/Access";
import { ActivitiesPage, NewsPage } from "./pages/Activities";
import { useAuth } from "@/_core/hooks/useAuth";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/members" component={MembersPage} />
    <Route path="/letters"><ManagementGate><DocumentsPage type="Surat" /></ManagementGate></Route>
    <Route path="/proposals"><ManagementGate><DocumentsPage type="Proposal" /></ManagementGate></Route>
    <Route path="/reports"><ManagementGate><DocumentsPage type="Laporan" /></ManagementGate></Route>
    <Route path="/assets" component={AssetsPage} />
    <Route path="/finance" component={FinancePage} />
    <Route path="/activities" component={ActivitiesPage} />
    <Route path="/news" component={NewsPage} />
    <Route path="/users" component={AccessPage} />
    <Route path="/settings" component={SettingsPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function ManagementGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user && ["member", "user"].includes(user.role)) return <div className="mx-auto max-w-[720px]"><Card className="mt-16 rounded-[28px] border-0 bg-[#243b32] text-white"><CardContent className="p-10 text-center"><ShieldAlert className="mx-auto mb-5 h-10 w-10 text-[#f2b49b]" /><h1 className="font-serif text-3xl font-bold">Akses terbatas</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">Jabatan Anggota tidak memiliki akses ke Surat menyurat, Proposal, dan Laporan. Hubungi Administrator jika membutuhkan perubahan jabatan.</p></CardContent></Card></div>;
  return <>{children}</>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><DashboardLayout><Router /></DashboardLayout></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
