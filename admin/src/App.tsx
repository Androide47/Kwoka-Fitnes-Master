import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "@/components/Shell";
import { useAuth } from "@/context/AuthContext";
import { BlogPage, ContentPage, NewsletterPage } from "@/pages/Publishing";
import { OrdersPage, ProductsPage } from "@/pages/Commerce";
import { DashboardPage } from "@/pages/Dashboard";
import { LoginPage } from "@/pages/Login";
import { BroadcastsPage, MediaPage, MessagesPage, SettingsPage } from "@/pages/Ops";
import { SupportPage } from "@/pages/Support";
import { BookingsPage, CreditsPage, ExercisesPage, WorkoutsPage } from "@/pages/Training";
import { UsersPage } from "@/pages/Users";

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <Protected>
            <Shell />
          </Protected>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/content" element={<ContentPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/broadcasts" element={<BroadcastsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
