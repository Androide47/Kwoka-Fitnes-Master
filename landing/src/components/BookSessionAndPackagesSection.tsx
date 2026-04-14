import { useRef } from "react";
import { Link } from "react-router-dom";
import { getMemberSession } from "@/lib/auth";
import { motion, useInView } from "framer-motion";
import { CalendarCheck, Check, Smartphone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { useCartContext } from "@/context/CartContext";
import { mockProducts } from "@/data/mockProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const packageProductIds = ["pkg-monthly-sessions", "pkg-app-training", "pkg-premium-subscription"] as const;

const bookDashboardState = { from: { pathname: "/dashboard", search: "?book=1" } } as const;

const packageExtras: Record<(typeof packageProductIds)[number], { icon: typeof CalendarCheck; bullets: string[] }> = {
  "pkg-monthly-sessions": {
    icon: CalendarCheck,
    bullets: ["Sessions pooled per month", "Flexible scheduling", "Demo pricing for checkout testing"],
  },
  "pkg-app-training": {
    icon: Smartphone,
    bullets: ["Training plans inside the app", "Progress and check-ins", "Great for remote coaching"],
  },
  "pkg-premium-subscription": {
    icon: Sparkles,
    bullets: ["Everything in app training", "Kwoka shirt included", "Branded water cup included"],
  },
};

const BookSessionAndPackagesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { refresh } = useCartContext();
  const member = getMemberSession();

  const packages = packageProductIds
    .map((id) => mockProducts.find((p) => p.id === id))
    .filter(Boolean) as typeof mockProducts;

  const handleAdd = (id: string, name: string) => {
    addToCart(id, 1);
    refresh();
    toast.success(`${name} added to cart`);
  };

  return (
    <section className="relative border-t border-border py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      <div ref={ref} className="container mx-auto px-4">
        {/* Test packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="font-display text-sm tracking-[0.3em] text-white">TESTING</span>
          <h3 className="mt-3 font-display text-xl tracking-wider text-white md:text-3xl">PACKAGES YOU CAN TRY</h3>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed md:text-base">
            These bundles are set up for checkout and cart testing. Add one to your cart, then head to the store to
            review—no real charges are processed.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {packages.map((product, index) => {
            const extra = packageExtras[product.id as (typeof packageProductIds)[number]];
            if (!extra) return null;
            const Icon = extra.icon;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.12 + index * 0.08 }}
              >
                <Card className="flex h-full flex-col border-border bg-card/80 transition-all hover:border-secondary/40 hover:shadow-md hover:shadow-secondary/5">
                  <CardHeader>
                    <div className="mb-3 inline-flex rounded-lg bg-secondary/30 p-3 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mb-1 font-display text-[10px] tracking-[0.25em] text-white/50">TEST PACKAGE</p>
                    <CardTitle className="font-display text-lg tracking-wide">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {extra.bullets.map((line) => (
                        <li key={line} className="flex gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="pt-2 text-2xl font-semibold text-foreground">${product.price}</p>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button
                      className="bg-secondary text-white hover:bg-secondary/90"
                      onClick={() => handleAdd(product.id, product.name)}
                    >
                      Add to cart
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/store/cart">View cart</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Book a session */}
        <motion.div
          id="book-session"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="mx-auto mt-20 max-w-3xl scroll-mt-28 rounded-2xl border border-border bg-card/60 p-8 text-center backdrop-blur-sm md:mt-24 md:p-12"
        >
          <span className="font-display text-sm tracking-[0.3em] text-white">SCHEDULE</span>
          <h2 className="mt-3 font-display text-2xl tracking-wider text-white md:text-4xl">BOOK A SESSION</h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground leading-relaxed">
            {member
              ? "Pick a date and time slot on your dashboard calendar. Your coach confirms each request."
              : "Create a free demo account to open your calendar and request sessions. You will need monthly session credits (store packages) before booking."}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="bg-secondary font-display text-xs tracking-widest text-white hover:bg-secondary/90">
              {member ? (
                <Link to="/dashboard?book=1">OPEN BOOKING CALENDAR</Link>
              ) : (
                <Link to="/register" state={bookDashboardState}>
                  CREATE ACCOUNT TO BOOK
                </Link>
              )}
            </Button>
            {!member && (
              <Button asChild variant="outline" size="lg" className="border-border font-display text-xs tracking-widest text-white hover:bg-white/5">
                <Link to="/login" state={bookDashboardState}>
                  SIGN IN TO BOOK
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg" className="border-border font-display text-xs tracking-widest text-white hover:bg-white/5">
              <Link to="/contact/issue">NEED HELP FIRST?</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BookSessionAndPackagesSection;
