import { Link } from "react-router-dom";
import { Github, Instagram, Twitter } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { getPanelPath } from "@/lib/auth";

const Footer = () => {
  const panelPath = getPanelPath();

  return (
    <footer id="site-footer" className="border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img src={logoIcon} alt="Kwoka" className="h-8 w-8" />
              <span className="font-display text-base tracking-widest text-white">KWOKA FITNESS</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              Innovation in personal training. Empowering athletes worldwide with next-generation
              fitness technology.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="mb-4 font-display text-xs tracking-[0.2em] text-white">NAVIGATE</h4>
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-sm text-white/80 transition-colors hover:text-white">
                  Home
                </Link>
                <Link
                  to="/store"
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  Store
                </Link>
                <Link to="/blog" className="text-sm text-white/80 transition-colors hover:text-white">
                  Blog
                </Link>
                <Link
                  to="/contact"
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-display text-xs tracking-[0.2em] text-white">ACCOUNT</h4>
              <div className="flex flex-col gap-2">
                {panelPath ? (
                  <Link
                    to={panelPath}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    Go to panel
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-sm text-white/80 transition-colors hover:text-white"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm text-white/80 transition-colors hover:text-white"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display text-xs tracking-[0.2em] text-white">CONNECT</h4>
            <div className="flex gap-4">
              {[Instagram, Twitter, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-white/70 transition-all hover:border-white/40 hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-xs text-white/55">
            © {new Date().getFullYear()} Kwoka Fitness. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
