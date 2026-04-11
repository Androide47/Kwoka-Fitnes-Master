import { useState, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  ShoppingBag,
  ChevronDown,
  Dumbbell,
  Package,
  FileDown,
  ShoppingCart,
  CreditCard,
  Compass,
  Smartphone,
  Star,
  Mail,
  MessageSquareWarning,
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { useCartContext } from "@/context/CartContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const triggerClass =
  "font-display text-xs tracking-[0.2em] text-white/75 data-[state=open]:text-white hover:text-white focus:text-white bg-transparent hover:bg-white/5 data-[state=open]:bg-white/10 h-10 px-3 rounded-md border-0";

const flatNavClass =
  "font-display text-xs tracking-[0.2em] text-white/75 hover:text-white focus:text-white bg-transparent hover:bg-white/5 h-10 inline-flex items-center px-3 rounded-md";

type MegaItemProps = {
  to: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  title: string;
  description: string;
};

function MegaItem({ to, icon: Icon, title, description }: MegaItemProps) {
  return (
    <NavigationMenuLink asChild>
      <Link
        to={to}
        className="flex gap-3 rounded-lg p-3 outline-none transition-colors hover:bg-white/5 focus:bg-white/5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/30 text-white">
          <Icon className="h-5 w-5" size={20} />
        </div>
        <div className="min-w-0 text-left">
          <div className="font-display text-xs tracking-wide text-white">{title}</div>
          <p className="mt-0.5 text-xs leading-snug text-white/55">{description}</p>
        </div>
      </Link>
    </NavigationMenuLink>
  );
}

function MobileNavLink({
  to,
  onNavigate,
  children,
}: {
  to: string;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="block rounded-md py-2 pl-3 text-sm text-white/85 hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lines } = useCartContext();
  const cartCount = lines.reduce((n, l) => n + l.qty, 0);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Promo strip — coach-style top bar */}
      <div className="border-b border-white/10 bg-secondary px-4 py-2 text-center text-sm text-white">
        <span className="text-white/90">Train smarter with Kwoka — </span>
        <Link to="/#download" className="font-semibold underline decoration-white/40 underline-offset-2 hover:decoration-white">
          Get the app
        </Link>
      </div>

      <motion.nav
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="overflow-visible border-b border-border bg-background/90 backdrop-blur-xl"
      >
        <div className="container mx-auto flex items-center justify-between gap-4 overflow-visible px-4 py-3 md:py-3.5">
          <Link to="/" className="flex shrink-0 items-center gap-2" onClick={closeMobile}>
            <img src={logoIcon} alt="Kwoka Fitness" className="h-10 w-10" />
            <span className="font-display text-lg tracking-widest text-white">KWOKA FITNESS</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden min-w-0 flex-1 items-center justify-center overflow-visible md:flex">
            <NavigationMenu className="relative z-10 w-full max-w-none justify-center overflow-visible">
              <NavigationMenuList className="flex flex-wrap items-center justify-center gap-1 space-x-0">
                {/* Store — primary mega menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={triggerClass}>STORE</NavigationMenuTrigger>
                  <NavigationMenuContent className="w-[min(100vw-2rem,52rem)] border-border bg-card p-0 shadow-xl">
                    <div className="grid gap-0 md:grid-cols-3">
                      <div className="border-b border-border p-5 md:border-b-0 md:border-r md:bg-muted/20">
                        <p className="mb-3 font-display text-[10px] tracking-[0.25em] text-white/50">SHOP</p>
                        <div className="flex flex-col gap-1">
                          <MegaItem
                            to="/store"
                            icon={Dumbbell}
                            title="Programs"
                            description="Training plans and digital programs."
                          />
                          <MegaItem
                            to="/store"
                            icon={Package}
                            title="Gear"
                            description="Equipment and recovery tools."
                          />
                          <MegaItem
                            to="/store"
                            icon={FileDown}
                            title="Digital"
                            description="Guides and downloadable resources."
                          />
                        </div>
                      </div>
                      <div className="border-b border-border p-5 md:border-b-0 md:border-r md:bg-muted/10">
                        <p className="mb-3 font-display text-[10px] tracking-[0.25em] text-white/50">YOUR ORDER</p>
                        <div className="flex flex-col gap-1">
                          <MegaItem
                            to="/store/cart"
                            icon={ShoppingCart}
                            title="Cart"
                            description="Review items before checkout."
                          />
                          <MegaItem
                            to="/store/checkout"
                            icon={CreditCard}
                            title="Checkout"
                            description="Shipping and payment (demo)."
                          />
                        </div>
                      </div>
                      <div className="flex flex-col justify-between gap-4 bg-secondary/25 p-5 md:min-h-[220px]">
                        <div>
                          <p className="font-display text-xs tracking-wider text-white">New to the store?</p>
                          <p className="mt-2 text-sm text-white/65">
                            Browse the full catalog—programs, gear, and digital guides in one place.
                          </p>
                        </div>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/store"
                            className="inline-flex w-full items-center justify-center rounded-lg bg-secondary px-4 py-2.5 font-display text-xs tracking-widest text-white transition-colors hover:bg-secondary/90"
                          >
                            SHOP ALL
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={triggerClass}>EXPLORE</NavigationMenuTrigger>
                  <NavigationMenuContent className="w-80 min-w-[18rem] border-border bg-card p-4 shadow-xl">
                    <div className="flex flex-col gap-1">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/#about"
                          className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-white/85 hover:bg-white/5 hover:text-white"
                        >
                          <Compass className="h-4 w-4 text-white/50" />
                          Our story
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/#download"
                          className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-white/85 hover:bg-white/5 hover:text-white"
                        >
                          <Smartphone className="h-4 w-4 text-white/50" />
                          Download app
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/#testimonials"
                          className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-white/85 hover:bg-white/5 hover:text-white"
                        >
                          <Star className="h-4 w-4 text-white/50" />
                          Success stories
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={triggerClass}>CONTACT</NavigationMenuTrigger>
                  <NavigationMenuContent className="w-80 min-w-[18rem] border-border bg-card p-4 shadow-xl">
                    <div className="flex flex-col gap-1">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/contact"
                          className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-white/85 hover:bg-white/5 hover:text-white"
                        >
                          <Mail className="h-4 w-4 text-white/50" />
                          Email us
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/contact/issue"
                          className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-white/85 hover:bg-white/5 hover:text-white"
                        >
                          <MessageSquareWarning className="h-4 w-4 text-white/50" />
                          Report an issue
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/blog" className={flatNavClass}>
                      BLOG
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/store/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border text-white/70 transition-colors hover:border-white/40 hover:text-white"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg border-2 border-white bg-transparent px-4 py-2 font-display text-sm tracking-wider text-white transition-colors hover:bg-white/10"
            >
              <User size={16} />
              LOGIN
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-secondary px-4 py-2 font-display text-sm tracking-wider text-white transition-colors hover:bg-secondary/90"
            >
              SIGN UP
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/store/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border text-white/70 transition-colors hover:border-white/40 hover:text-white"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white" aria-expanded={mobileOpen}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border bg-background/98 backdrop-blur-xl md:hidden"
            >
              <div className="max-h-[min(70vh,520px)] space-y-1 overflow-y-auto px-4 py-4">
                <Collapsible defaultOpen={false} className="group/coll rounded-lg border border-border/80 bg-card/40">
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 font-display text-xs tracking-[0.2em] text-white">
                    STORE
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/coll:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 border-t border-border/60 px-2 pb-3 pt-1">
                    <MobileNavLink to="/store" onNavigate={closeMobile}>
                      Shop catalog
                    </MobileNavLink>
                    <MobileNavLink to="/store/cart" onNavigate={closeMobile}>
                      Cart
                    </MobileNavLink>
                    <MobileNavLink to="/store/checkout" onNavigate={closeMobile}>
                      Checkout
                    </MobileNavLink>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible defaultOpen={false} className="group/coll rounded-lg border border-border/80 bg-card/40">
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 font-display text-xs tracking-[0.2em] text-white">
                    EXPLORE
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/coll:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 border-t border-border/60 px-2 pb-3 pt-1">
                    <MobileNavLink to="/#about" onNavigate={closeMobile}>
                      Our story
                    </MobileNavLink>
                    <MobileNavLink to="/#download" onNavigate={closeMobile}>
                      Download app
                    </MobileNavLink>
                    <MobileNavLink to="/#testimonials" onNavigate={closeMobile}>
                      Success stories
                    </MobileNavLink>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible defaultOpen={false} className="group/coll rounded-lg border border-border/80 bg-card/40">
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 font-display text-xs tracking-[0.2em] text-white">
                    CONTACT
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/coll:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 border-t border-border/60 px-2 pb-3 pt-1">
                    <MobileNavLink to="/contact" onNavigate={closeMobile}>
                      Email us
                    </MobileNavLink>
                    <MobileNavLink to="/contact/issue" onNavigate={closeMobile}>
                      Report an issue
                    </MobileNavLink>
                  </CollapsibleContent>
                </Collapsible>

                <Link
                  to="/blog"
                  onClick={closeMobile}
                  className="flex items-center rounded-lg border border-border/80 bg-card/40 px-4 py-3 font-display text-xs tracking-[0.2em] text-white hover:bg-white/5"
                >
                  BLOG
                </Link>

                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-white bg-transparent px-4 py-3 font-display text-sm tracking-wider text-white hover:bg-white/10"
                  >
                    <User size={16} />
                    LOGIN
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="flex flex-1 items-center justify-center rounded-lg bg-secondary px-4 py-3 font-display text-sm tracking-wider text-white hover:bg-secondary/90"
                  >
                    SIGN UP
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
