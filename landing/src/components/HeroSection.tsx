import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getMemberSession } from "@/lib/auth";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Circle,
  Download,
  Hexagon,
  Play,
} from "lucide-react";
import heroImg from "@/assets/hero-bg.jpg";

const features = [
  "Personalized training plans built around your goals",
  "Coaches and programs designed for real-world performance",
  "Track progress with analytics inside the Kwoka app",
];

const exercises = [
  { name: "Barbell Back Squat", detail: "4×6 · 185 lbs", done: true, active: true, strikethrough: false },
  { name: "Romanian Deadlift", detail: "3×8 · 155 lbs", done: true, active: true, strikethrough: true },
  { name: "Bulgarian Split Squat", detail: "3×10 · 65 lbs", done: false, active: false, strikethrough: false },
  { name: "Leg Press", detail: "3×12 · 270 lbs", done: false, active: false, strikethrough: false },
];

const stats = [
  { value: "2,400+", label: "Active clients" },
  { value: "98%", label: "Goal achievement" },
  { value: "150+", label: "Expert trainers" },
  { value: "8 YRS", label: "Proven results" },
];

const bookDashboardState = { from: { pathname: "/dashboard", search: "?book=1" } } as const;

const HeroSection = () => {
  const member = getMemberSession();
  return (
  <section id="home" className="relative min-h-screen overflow-hidden pt-6 md:pt-10">
    <div className="absolute inset-0 bg-hero-hex" />
    <div className="absolute inset-0">
      <img src={heroImg} alt="" className="h-full w-full object-cover opacity-[0.12]" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background" />
    </div>
    <div className="absolute top-1/4 left-0 h-72 w-72 rounded-full bg-primary/5 blur-[100px]" />
    <div className="absolute bottom-1/4 right-0 h-80 w-80 rounded-full bg-secondary/10 blur-[120px]" />

    <div className="relative z-10 container mx-auto flex min-h-[calc(100vh-5rem)] flex-col justify-center px-4 pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Copy */}
        <div className="text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.8)]" />
            <span className="font-display text-[10px] tracking-[0.28em] text-primary md:text-[11px]">
              ELITE PERFORMANCE TRAINING
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display text-4xl leading-[1.1] tracking-wide text-white md:text-5xl lg:text-6xl"
          >
            TRAIN SMART.
            <br />
            <span className="text-primary">LIVE</span>{" "}
            <span className="text-gradient">STRONG.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-6 max-w-xl font-body text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Kwoka Fitness blends intelligent programming with human coaching—whether you are building strength,
            improving conditioning, or chasing a performance goal, we build the plan around you and your schedule.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-8 space-y-3"
          >
            {features.map((line) => (
              <li key={line} className="flex items-start gap-3 font-body text-sm text-muted-foreground md:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {line}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <a
              href="#download"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-7 py-3.5 font-display text-xs tracking-widest text-white transition-colors hover:bg-secondary/90 md:px-8 md:py-4"
            >
              <Download className="h-4 w-4" />
              GET THE APP
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            {member ? (
              <Link
                to="/dashboard?book=1"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-7 py-3.5 font-display text-xs tracking-widest text-white transition-colors hover:border-primary/50 hover:bg-card/40 md:px-8 md:py-4"
              >
                <CalendarCheck className="h-4 w-4 text-primary" />
                BOOK A SESSION
              </Link>
            ) : (
              <Link
                to="/register"
                state={bookDashboardState}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-7 py-3.5 font-display text-xs tracking-widest text-white transition-colors hover:border-primary/50 hover:bg-card/40 md:px-8 md:py-4"
              >
                <CalendarCheck className="h-4 w-4 text-primary" />
                BOOK A SESSION
              </Link>
            )}
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/80 px-7 py-3.5 font-display text-xs tracking-widest text-white/90 transition-colors hover:border-white/40 hover:text-white md:px-8 md:py-4"
            >
              <Play className="h-4 w-4" />
              OUR STORY
            </a>
          </motion.div>
        </div>

        {/* Dashboard-style cards */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/15 blur-2xl" />
          <div className="relative rounded-2xl border border-border bg-card/90 p-5 shadow-xl backdrop-blur-md md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-[10px] tracking-[0.25em] text-primary">TODAY&apos;S WORKOUT</p>
                <h2 className="mt-1 font-display text-lg tracking-wide text-white md:text-xl">POWER STRENGTH BLOCK</h2>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-secondary/35 text-white">
                <Hexagon className="h-6 w-6" strokeWidth={1.25} />
              </div>
            </div>

            <ul className="mt-6 space-y-0 rounded-xl border border-border/80 bg-background/40">
              {exercises.map((row) => (
                <li
                  key={row.name}
                  className={`flex items-center justify-between gap-3 border-b border-border/60 px-3 py-3 last:border-b-0 md:px-4 ${
                    row.active ? "bg-primary/[0.06]" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {row.done ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary/60 bg-primary/20 text-primary">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-white/25" strokeWidth={1.5} />
                    )}
                    <span
                      className={`truncate font-body text-sm ${row.strikethrough ? "text-muted-foreground line-through" : "text-foreground"}`}
                    >
                      {row.name}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{row.detail}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-3">
              <span className="whitespace-nowrap font-body text-xs text-muted-foreground">2 of 4 complete</span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-primary to-secondary" />
              </div>
              <span className="font-display text-xs tracking-wider text-primary">50%</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-card/80 px-4 py-4 backdrop-blur-sm md:px-5 md:py-5"
              >
                <p className="font-display text-xl tracking-wide text-primary md:text-2xl">{s.value}</p>
                <p className="mt-1 font-body text-[11px] uppercase tracking-wide text-muted-foreground md:text-xs">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="mt-14 flex justify-center lg:mt-16"
      >
        <a href="#about" className="text-white/50 transition-colors hover:text-white/80" aria-label="Scroll to content">
          <ChevronDown size={28} className="animate-float" />
        </a>
      </motion.div>
    </div>
  </section>
  );
};

export default HeroSection;
