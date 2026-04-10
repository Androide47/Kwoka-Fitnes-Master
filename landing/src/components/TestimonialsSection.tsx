import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "ALEX MARTINEZ",
    role: "Marathon Runner",
    text: "Kwoka Fitness completely transformed my training routine. The AI-powered plans adapted perfectly to my race schedule.",
    stars: 5,
  },
  {
    name: "SARAH CHEN",
    role: "Crossfit Athlete",
    text: "The real-time analytics are a game changer. I can see my progress in ways I never imagined possible before.",
    stars: 5,
  },
  {
    name: "JAMES OKAFOR",
    role: "Bodybuilder",
    text: "Recovery tracking alone was worth it. I've reduced my injury rate dramatically since switching to Kwoka.",
    stars: 5,
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* BG glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-accent/5 blur-[150px]" />

      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-display text-sm tracking-[0.3em] text-primary">
            TESTIMONIALS
          </span>
          <h2 className="mt-3 font-display text-2xl md:text-4xl tracking-wider text-gradient">
            SUCCESS STORIES
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="relative rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:glow-brand"
            >
              <Quote size={28} className="text-primary/30 mb-4" />
              <p className="text-muted-foreground leading-relaxed mb-6">
                "{t.text}"
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star
                    key={si}
                    size={14}
                    className="fill-primary text-primary"
                  />
                ))}
              </div>
              <p className="font-display text-sm tracking-wider text-foreground">
                {t.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
