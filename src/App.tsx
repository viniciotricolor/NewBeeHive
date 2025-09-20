import { Toaster } from "@/components/ui/toaster";
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
import AboutPage from "./pages/About"; // Import the new About page
import Footer from "./components/Footer"; // Import the new Footer component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="hive">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="relative min-h-screen flex flex-col"> {/* Added flex-col for footer at bottom */}
            <div className="absolute top-4 right-4 z-10">
              <ThemeToggle />
            </div>
            <div className="flex-grow"> {/* Content wrapper to push footer down */}
              <Routes>
                <Route path="/" element={<HiveUsers />} />
                <Route path="/hive-users" element={<HiveUsers />} />
                <Route path="/users/:username" element={<UserProfile />} />
                <Route path="/post/:author/:permlink" element={<PostDetail />} />
                <Route path="/about" element={<AboutPage />} /> {/* New route for About page */}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer /> {/* Add Footer component */}
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;