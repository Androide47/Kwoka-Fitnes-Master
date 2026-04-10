import { Github, Instagram, Twitter } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

const Footer = () => (
  <footer id="contact" className="border-t border-border py-16">
    <div className="container mx-auto px-4">
      <div className="grid gap-10 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={logoIcon} alt="Kwoka" className="h-8 w-8" />
            <span className="font-display text-base tracking-widest text-gradient">
              KWOKA FITNESS
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Innovation in personal training. Empowering athletes worldwide
            with next-generation fitness technology.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-display text-xs tracking-[0.2em] text-foreground mb-4">
              NAVIGATE
            </h4>
            <div className="flex flex-col gap-2">
              {["Home", "Store", "Blog", "Contact"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase()}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-xs tracking-[0.2em] text-foreground mb-4">
              ACCOUNT
            </h4>
            <div className="flex flex-col gap-2">
              {["Login", "Dashboard", "Privacy", "Terms"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-display text-xs tracking-[0.2em] text-foreground mb-4">
            CONNECT
          </h4>
          <div className="flex gap-4">
            {[Instagram, Twitter, Github].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-border pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kwoka Fitness. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
