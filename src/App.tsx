import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import HiveUsers from "./pages/HiveUsers";
import UserProfile from "./pages/UserProfile";
import PostDetail from "./pages/PostDetail";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/About";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react"; // Importando SpeedInsights para React

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="hive">
      <TooltipProvider>
        {/* <Toaster /> -- Removido o Toaster do Radix UI */}
        <Sonner />
        <BrowserRouter>
          <div className="relative min-h-screen flex flex-col">
            <div className="absolute top-4 right-4 z-10">
              <ThemeToggle />
            </div>
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<HiveUsers />} />
                <Route path="/hive-users" element={<HiveUsers />} />
                <Route path="/users/:username" element={<UserProfile />} />
                <Route path="/post/:author/:permlink" element={<PostDetail />} />
                <Route path="/about" element={<AboutPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
            <Analytics />
            <SpeedInsights /> {/* Adicionando o componente SpeedInsights aqui */}
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;