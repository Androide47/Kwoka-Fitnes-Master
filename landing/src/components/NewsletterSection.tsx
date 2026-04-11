import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send } from "lucide-react";

const NewsletterSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");

  return (
    <section className="relative py-24 md:py-32" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-2xl rounded-2xl border border-border bg-card p-10 md:p-14 text-center overflow-hidden"
        >
          {/* BG glow */}
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-secondary/10 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-secondary/10 blur-[80px]" />

          <div className="relative z-10">
            <span className="font-display text-sm tracking-[0.3em] text-white">
              STAY UPDATED
            </span>
            <h2 className="mt-3 font-display text-2xl md:text-3xl tracking-wider text-white">
              JOIN THE MOVEMENT
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Subscribe to our newsletter for exclusive training tips,
              early access features, and community updates.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 rounded-lg border border-border bg-input px-5 py-3 text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 font-display text-sm tracking-widest text-white transition-colors hover:bg-secondary/90"
              >
                <Send size={16} />
                SUBSCRIBE
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
