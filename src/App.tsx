import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LowCreditAlert } from "@/components/LowCreditAlert";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import Agents from "./pages/Agents";
import Scripts from "./pages/Scripts";
import Analytics from "./pages/Analytics";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import CreditHistory from "./pages/CreditHistory";
import AdminCredits from "./pages/AdminCredits";
import PhoneNumbers from "./pages/PhoneNumbers";
import Bookings from "./pages/Bookings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>
      <LowCreditAlert />
      {children}
    </AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CreditsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/app" element={<AppRoute><Dashboard /></AppRoute>} />
              <Route path="/app/leads" element={<AppRoute><Leads /></AppRoute>} />
              <Route path="/app/campaigns" element={<AppRoute><Campaigns /></AppRoute>} />
              <Route path="/app/campaigns/:id" element={<AppRoute><CampaignDetail /></AppRoute>} />
              <Route path="/app/bookings" element={<AppRoute><Bookings /></AppRoute>} />
              <Route path="/app/agents" element={<AppRoute><Agents /></AppRoute>} />
              <Route path="/app/scripts" element={<AppRoute><Scripts /></AppRoute>} />
              <Route path="/app/analytics" element={<AppRoute><Analytics /></AppRoute>} />
              <Route path="/app/integrations" element={<AppRoute><Integrations /></AppRoute>} />
              <Route path="/app/settings" element={<AppRoute><Settings /></AppRoute>} />
              <Route path="/app/billing" element={<AppRoute><Billing /></AppRoute>} />
              <Route path="/app/credit-history" element={<AppRoute><CreditHistory /></AppRoute>} />
              <Route path="/app/phone-numbers" element={<AppRoute><PhoneNumbers /></AppRoute>} />
              <Route path="/app/admin/credits" element={<AppRoute><AdminCredits /></AppRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CreditsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
