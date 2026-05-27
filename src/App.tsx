import { lazy, Suspense } from 'react';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { HelmetProvider } from 'react-helmet-async';
import { LocaleProvider } from '@/i18n/context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const HiveUsers = lazy(() => import('./pages/HiveUsers'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AboutPage = lazy(() => import('./pages/About'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="hive">
        <LocaleProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <div className="relative min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow">
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route path="/" element={<HiveUsers />} />
                      <Route path="/hive-users" element={<HiveUsers />} />
                      <Route path="/users/:username" element={<UserProfile />} />
                      <Route path="/post/:author/:permlink" element={<PostDetail />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </div>
                <Footer />
                <Analytics />
                <SpeedInsights />
              </div>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
