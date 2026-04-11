import { Link, Outlet } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";

const AuthLayout = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <header className="border-b border-border px-4 py-4">
      <Link to="/" className="inline-flex items-center gap-2">
        <img src={logoIcon} alt="Kwoka Fitness" className="h-9 w-9" />
        <span className="font-display text-sm tracking-widest text-white">
          KWOKA FITNESS
        </span>
      </Link>
    </header>
    <div className="flex-1 flex items-center justify-center p-4">
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
