import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import UserDashboard from "@/pages/user/UserDashboard.tsx";
import UserSettings from "@/pages/user/UserSettings.tsx";
import ContactEmail from "@/pages/contact/ContactEmail.tsx";
import ContactIssue from "@/pages/contact/ContactIssue.tsx";
import TrainerOverview from "@/pages/trainer/TrainerOverview.tsx";
import TrainerClients from "@/pages/trainer/TrainerClients.tsx";
import TrainerSchedule from "@/pages/trainer/TrainerSchedule.tsx";
import TrainerSettings from "@/pages/trainer/TrainerSettings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            </Route>

            <Route
              element={
                <RequireMember>
                  <MemberLayout />
                </RequireMember>
              }
            >
              <Route path="/dashboard" element={<UserDashboard />} />
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
              <Route path="/trainer/clients" element={<TrainerClients />} />
              <Route path="/trainer/schedule" element={<TrainerSchedule />} />
              <Route path="/trainer/settings" element={<TrainerSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
