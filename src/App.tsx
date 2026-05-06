import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";

const IntelTrackerOverlay = lazy(() => import("@/components/IntelTrackerOverlay"));
const PremiumCartModal = lazy(() => import("@/components/PremiumCartModal"));
const ProtectedAdminRoute = lazy(() => import("@/components/ProtectedAdminRoute"));
const Index = lazy(() => import("./pages/Index"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GunLabPage = lazy(() => import("./pages/GunLabPage"));
const Gunsmith3DPage = lazy(() => import("./pages/Gunsmith3DPage"));

const queryClient = new QueryClient();

const TacticalLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#040404] text-[11px] font-bold uppercase tracking-[0.34em] text-red-300">
    <span className="animate-pulse rounded-full border border-red-500/20 bg-red-600/10 px-5 py-3 shadow-[0_0_30px_rgba(220,38,38,0.16)]">
      Loading tactical feed...
    </span>
  </div>
);

const LazyCartModal = () => {
  const isCartOpen = useCartStore((state) => state.isCartOpen);

  if (!isCartOpen) return null;

  return (
    <Suspense fallback={null}>
      <PremiumCartModal />
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={null}>
          <IntelTrackerOverlay />
        </Suspense>
        <LazyCartModal />
        <Suspense fallback={<TacticalLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/gun-lab" element={<GunLabPage />} />
            <Route path="/gunsmith-3d" element={<Gunsmith3DPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<ProtectedAdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
