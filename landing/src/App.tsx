import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import MarketingLayout from "@/layouts/MarketingLayout";
import AuthLayout from "@/layouts/AuthLayout";
import MemberLayout from "@/layouts/MemberLayout";
import TrainerLayout from "@/layouts/TrainerLayout";
import RequireMember from "@/components/RequireMember";
import RequireTrainer from "@/components/RequireTrainer";
import Index from "@/pages/Index.tsx";
import NotFound from "@/pages/NotFound.tsx";
import StoreCatalog from "@/pages/store/StoreCatalog.tsx";
import StoreCart from "@/pages/store/StoreCart.tsx";
import StoreCheckout from "@/pages/store/StoreCheckout.tsx";
import BlogIndex from "@/pages/blog/BlogIndex.tsx";
import BlogPost from "@/pages/blog/BlogPost.tsx";
import Login from "@/pages/auth/Login.tsx";
import Register from "@/pages/auth/Register.tsx";
import ForgotPassword from "@/pages/auth/ForgotPassword.tsx";
import ResetPassword from "@/pages/auth/ResetPassword.tsx";
import ContactSupport from "@/pages/auth/ContactSupport.tsx";
import Onboarding from "@/pages/onboarding/Onboarding.tsx";
import UserDashboard from "@/pages/user/UserDashboard.tsx";
import UserSettings from "@/pages/user/UserSettings.tsx";
import UserWorkouts from "@/pages/user/UserWorkouts.tsx";
import UserWorkoutDetail from "@/pages/user/UserWorkoutDetail.tsx";
import UserProgress from "@/pages/user/UserProgress.tsx";
import UserCalendar from "@/pages/user/UserCalendar.tsx";
import UserMessages from "@/pages/user/UserMessages.tsx";
import RequireOnboarding from "@/components/RequireOnboarding";
import ContactEmail from "@/pages/contact/ContactEmail.tsx";
import ContactIssue from "@/pages/contact/ContactIssue.tsx";
import TrainerOverview from "@/pages/trainer/TrainerOverview.tsx";
import TrainerWorkouts from "@/pages/trainer/TrainerWorkouts.tsx";
import TrainerLibrary from "@/pages/trainer/TrainerLibrary.tsx";
import TrainerCalendar from "@/pages/trainer/TrainerCalendar.tsx";
import TrainerChat from "@/pages/trainer/TrainerChat.tsx";
import TrainerBlog from "@/pages/trainer/TrainerBlog.tsx";
import TrainerSettings from "@/pages/trainer/TrainerSettings.tsx";
import TrainerAbout from "@/pages/trainer/TrainerAbout.tsx";

const queryClient = new QueryClient();

// Vite BASE_URL includes a trailing slash; React Router basename must not.
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={routerBasename}>
        <CartProvider>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/store" element={<StoreCatalog />} />
              <Route path="/store/cart" element={<StoreCart />} />
              <Route path="/store/checkout" element={<StoreCheckout />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<ContactEmail />} />
              <Route path="/contact/issue" element={<ContactIssue />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword accountKind="member" />} />
              <Route path="/forgot-password/coach" element={<ForgotPassword accountKind="trainer" />} />
              <Route path="/reset-password" element={<ResetPassword accountKind="member" />} />
              <Route path="/reset-password/coach" element={<ResetPassword accountKind="trainer" />} />
              <Route path="/contact-support" element={<ContactSupport />} />
              <Route
                path="/onboarding"
                element={
                  <RequireMember>
                    <Onboarding />
                  </RequireMember>
                }
              />
            </Route>

            <Route
              element={
                <RequireMember>
                  <RequireOnboarding>
                    <MemberLayout />
                  </RequireOnboarding>
                </RequireMember>
              }
            >
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/workouts" element={<UserWorkouts />} />
              <Route path="/workouts/:id" element={<UserWorkoutDetail />} />
              <Route path="/progress" element={<UserProgress />} />
              <Route path="/calendar" element={<UserCalendar />} />
              <Route path="/messages" element={<UserMessages />} />
              <Route path="/settings" element={<UserSettings />} />
            </Route>

            <Route
              element={
                <RequireTrainer>
                  <TrainerLayout />
                </RequireTrainer>
              }
            >
              <Route path="/trainer" element={<TrainerOverview />} />
              <Route path="/trainer/workouts" element={<TrainerWorkouts />} />
              <Route path="/trainer/library" element={<TrainerLibrary />} />
              <Route path="/trainer/calendar" element={<TrainerCalendar />} />
              <Route path="/trainer/chat" element={<TrainerChat />} />
              <Route path="/trainer/blog" element={<TrainerBlog />} />
              <Route path="/trainer/settings" element={<TrainerSettings />} />
              <Route path="/trainer/about" element={<TrainerAbout />} />
              {/* Legacy redirects */}
              <Route path="/trainer/clients" element={<Navigate to="/trainer/workouts" replace />} />
              <Route path="/trainer/schedule" element={<Navigate to="/trainer/calendar" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
