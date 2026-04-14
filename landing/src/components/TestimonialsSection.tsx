import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  coach: string;
  quote: string;
  result: string;
  goal: string;
  initials: string;
};

const testimonials: Testimonial[] = [
  {
    name: "MARCUS RIVERA",
    role: "Software Engineer",
    coach: "Trained by Coach Tanya B.",
    quote:
      "I had tried three other programs before finding Kwoka Fitness. The difference is night and day. My coach did not just assign workouts — she understood my schedule, my stress, and built a plan that fit my life. Down 42 pounds and I have kept it off for a year.",
    result: "-42 LBS IN 5 MONTHS",
    goal: "Goal: Weight loss",
    initials: "MR",
  },
  {
    name: "PRIYA NAIR",
    role: "Product Designer",
    coach: "Trained by Coach James L.",
    quote:
      "The app keeps me honest between sessions. Strength numbers climbed every month and I finally feel confident under a barbell. Kwoka is the first system I have stuck with for more than six weeks.",
    result: "+85 LBS ON SQUAT",
    goal: "Goal: Strength",
    initials: "PN",
  },
  {
    name: "DEREK OKAFOR",
    role: "Nurse & Parent",
    coach: "Trained by Coach Maria S.",
    quote:
      "Night shifts made training feel impossible. Kwoka built short, efficient blocks I could do at odd hours and still recover. Energy is up, and my doctor noticed the change at my last checkup.",
    result: "-18% BODY FAT",
    goal: "Goal: Health & energy",
    initials: "DO",
  },
  {
    name: "ELENA VASQUEZ",
    role: "Graduate Student",
    coach: "Trained by Coach Tanya B.",
    quote:
      "I wanted structure without living in the gym. The hybrid plan — app sessions plus monthly form checks — kept me progressing without burning out during finals.",
    result: "12-WEEK STREAK",
    goal: "Goal: Consistency",
    initials: "EV",
  },
  {
    name: "JORDAN LEE",
    role: "Sales Director",
    coach: "Trained by Coach Alex R.",
    quote:
      "Travel used to wreck my routine. Kwoka rewrote workouts for hotel gyms and bodyweight days. I am leaner at 38 than I was at 28, and I still enjoy dinners with clients.",
    result: "-22 LBS IN 4 MONTHS",
    goal: "Goal: Travel-ready fitness",
    initials: "JL",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);
  const len = testimonials.length;
  const t = testimonials[active];

  const go = (delta: number) => {
    setActive((i) => (i + delta + len) % len);
  };

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-[hsl(220_14%_93%)] py-20 text-zinc-900 md:py-28"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent" />

      <div className="container relative mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-10 max-w-3xl text-center md:mb-14"
        >
          <span className="inline-flex rounded-full bg-[hsl(180_55%_90%)] px-3 py-1 font-display text-[10px] tracking-[0.28em] text-[hsl(180_70%_28%)]">
            CLIENT RESULTS
          </span>
          <h2 className="mt-4 font-display text-3xl tracking-wide text-zinc-950 md:text-4xl lg:text-5xl">
            REAL TRANSFORMATIONS
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-zinc-600 md:text-lg">
            Over 2,400 clients have transformed their bodies and lives with Kwoka Fitness coaching and the app.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mx-auto max-w-4xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-xl shadow-zinc-900/10 md:p-10 lg:p-12">
            <div className="pointer-events-none absolute right-8 top-8 text-[hsl(180_50%_88%)]">
              <Quote className="h-24 w-24 md:h-32 md:w-32" strokeWidth={1} />
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 md:h-5 md:w-5" aria-hidden />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="relative z-10 mt-8"
              >
                <blockquote className="font-body text-lg italic leading-relaxed text-zinc-700 md:text-xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(180_60%_45%)] to-[hsl(280_45%_50%)] font-display text-sm font-semibold text-white shadow-md md:h-16 md:w-16 md:text-base"
                      aria-hidden
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-display text-sm tracking-wide text-zinc-950">{t.name}</p>
                      <p className="mt-0.5 text-sm text-zinc-500">{t.role}</p>
                      <p className="mt-1 text-xs font-medium text-[hsl(180_70%_32%)]">{t.coach}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[hsl(210_60%_96%)] px-5 py-4">
                    <p className="font-display text-sm tracking-wide text-[hsl(210_55%_35%)]">
                      {t.result}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{t.goal}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-10">
            <button
              type="button"
              onClick={() => go(-1)}
              className="order-2 flex items-center gap-1 font-display text-xs tracking-[0.2em] text-zinc-500 transition-colors hover:text-zinc-800 sm:order-1"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
              PREV
            </button>
            <div className="order-1 flex gap-2 sm:order-2" role="tablist" aria-label="Choose testimonial">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    i === active ? "bg-[hsl(210_70%_48%)]" : "bg-zinc-300"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              className="order-3 flex items-center gap-1 font-display text-xs tracking-[0.2em] text-zinc-500 transition-colors hover:text-zinc-800"
              aria-label="Next testimonial"
            >
              NEXT
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-auto mt-12 flex max-w-4xl gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {testimonials.map((item, i) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActive(i)}
                className={`min-w-[11.5rem] shrink-0 rounded-xl border-2 bg-white p-3 text-left shadow-sm transition-all sm:min-w-0 ${
                  active === i
                    ? "border-[hsl(280_45%_52%)] shadow-md shadow-[hsl(280_45%_52%)]/15"
                    : "border-transparent hover:border-zinc-200"
                }`}
              >
                <div className="mb-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                  ))}
                </div>
                <p className="line-clamp-3 text-[11px] italic leading-relaxed text-zinc-600">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(180_55%_42%)] to-[hsl(280_40%_48%)] text-[10px] font-bold text-white">
                    {item.initials}
                  </div>
                  <span className="font-display text-[10px] tracking-wide text-zinc-900">{item.name}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
