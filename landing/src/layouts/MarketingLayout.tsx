import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MarketingLayout = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 pt-[7.25rem] md:pt-[7.5rem]">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MarketingLayout;
