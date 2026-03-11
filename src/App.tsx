import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import IntelTrackerOverlay from "@/components/IntelTrackerOverlay";
import PremiumCartModal from "@/components/PremiumCartModal";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import GunLabPage from "./pages/GunLabPage";
import Gunsmith3DPage from "./pages/Gunsmith3DPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <IntelTrackerOverlay />
        <PremiumCartModal />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gun-lab" element={<GunLabPage />} />
          <Route path="/gunsmith-3d" element={<Gunsmith3DPage />} />
          <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
