import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import Seo from "@/components/Seo";
import PublicInfoPage from "@/pages/PublicInfoPage";
import ContactPage from "@/pages/ContactPage";
import LegalPage from "@/pages/LegalPage";
import { legalPages } from "@/pages/legalContent";

const IntelTrackerOverlay = lazy(() => import("@/components/IntelTrackerOverlay"));
const PremiumCartModal = lazy(() => import("@/components/PremiumCartModal"));
const ProtectedAdminRoute = lazy(() => import("@/components/ProtectedAdminRoute"));
const Index = lazy(() => import("./pages/Index"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const NotFound = lazy(() => import("./pages/NotFound"));
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
        <Seo />
        <Suspense fallback={<TacticalLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/custom-builds"
              element={
                <PublicInfoPage
                  eyebrow="Custom builds"
                  title="Custom Airsoft Builds"
                  intro="Индивидуални airsoft конфигурации според стил на игра, визия, бюджет и срок. Всеки проект започва с уточнение, съвместимост на частите и реалистични очаквания."
                  cards={[
                    { title: "Индивидуален подход", text: "Конфигурацията се планира според платформа, роля, терен и предпочитано усещане при игра." },
                    { title: "Бюджет и визия", text: "Уточняваме приоритетите, за да предложим подходящ build без излишни обещания." },
                    { title: "Потвърждение преди работа", text: "Не започваме custom build без предварително уточнение и потвърждение." },
                  ]}
                />
              }
            />
            <Route
              path="/service"
              element={
                <PublicInfoPage
                  eyebrow="Service"
                  title="Airsoft сервиз и поддръжка"
                  intro="Диагностика, профилактика, ремонт и настройка на airsoft реплики след предварителна консултация и потвърждение."
                  cards={[
                    { title: "Диагностика", text: "Описвате проблема, а при нужда репликата се преглежда за причина, части и реалистичен срок." },
                    { title: "Профилактика", text: "Почистване, смазване, настройка и проверка на ключови компоненти според състоянието." },
                    { title: "Ремонт", text: "Работа по конкретен проблем само след уточнение на бюджета, частите и очаквания резултат." },
                  ]}
                />
              }
            />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/inventory"
              element={
                <PublicInfoPage
                  eyebrow="Inventory"
                  title="Наличности"
                  intro="Публичният каталог се подготвя. За конкретна наличност, gear идея или setup препоръка изпратете запитване."
                  cards={[
                    { title: "Очаквайте скоро", text: "Ще бъдат добавени актуални наличности, снимки и основна информация за продуктите." },
                    { title: "Реални снимки", text: "Планираният каталог ще използва реални изображения, когато са налични." },
                    { title: "Запитване", text: "До пускането на каталога най-сигурният път е директно запитване през контактната форма." },
                  ]}
                />
              }
            />
            <Route path="/terms" element={<LegalPage {...legalPages.terms} />} />
            <Route path="/privacy-policy" element={<LegalPage {...legalPages.privacy} />} />
            <Route path="/returns" element={<LegalPage {...legalPages.returns} />} />
            <Route path="/delivery-payment" element={<LegalPage {...legalPages.deliveryPayment} />} />
            <Route path="/warranty" element={<LegalPage {...legalPages.warranty} />} />
            <Route path="/service-terms" element={<LegalPage {...legalPages.serviceTerms} />} />
            <Route path="/custom-order-terms" element={<LegalPage {...legalPages.customOrderTerms} />} />
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
