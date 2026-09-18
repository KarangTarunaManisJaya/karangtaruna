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

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/members" component={MembersPage} />
    <Route path="/letters"><DocumentsPage type="Surat" /></Route>
    <Route path="/proposals"><DocumentsPage type="Proposal" /></Route>
    <Route path="/reports"><DocumentsPage type="Laporan" /></Route>
    <Route path="/assets" component={AssetsPage} />
    <Route path="/finance" component={FinancePage} />
    <Route path="/users" component={AccessPage} />
    <Route path="/settings" component={SettingsPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><DashboardLayout><Router /></DashboardLayout></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
