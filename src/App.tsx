import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider
import { ThemeToggle } from "@/components/ThemeToggle"; // Import ThemeToggle
import HiveUsers from "./pages/HiveUsers";
import UserProfile from "./pages/UserProfile";
import PostDetail from "./pages/PostDetail"; // Import the new PostDetail page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="hive"> {/* Definido defaultTheme como 'hive' e removido storageKey */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="relative min-h-screen"> {/* Added div for layout */}
            <div className="absolute top-4 right-4 z-10"> {/* Position ThemeToggle */}
              <ThemeToggle />
            </div>
            <Routes>
              <Route path="/" element={<HiveUsers />} />
              <Route path="/hive-users" element={<HiveUsers />} />
              <Route path="/users/:username" element={<UserProfile />} />
              <Route path="/post/:author/:permlink" element={<PostDetail />} /> {/* New route for post details */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;