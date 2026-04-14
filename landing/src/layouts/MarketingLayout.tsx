import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MarketingLayout = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 pt-20">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MarketingLayout;
