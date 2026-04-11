import { motion } from "framer-motion";
import { Download, ChevronDown } from "lucide-react";
import heroImg from "@/assets/hero-bg.jpg";
import logoFull from "@/assets/logo-full.png";

const HeroSection = () => (
  <section
    id="home"
    className="relative flex min-h-screen items-center justify-center overflow-hidden"
  >
    {/* BG Image */}
    <div className="absolute inset-0">
      <img
        src={heroImg}
        alt=""
        className="h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
    </div>

    {/* Decorative glow orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-[120px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

    <div className="relative z-10 container mx-auto px-4 text-center">
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        src={logoFull}
        alt="Kwoka Fitness"
        className="mx-auto mb-8 h-20 md:h-28 w-auto invert"
      />

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="font-display text-3xl md:text-5xl lg:text-6xl tracking-widest text-white leading-tight"
      >
        INNOVATION IN
        <br />
        PERSONAL TRAINING
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mx-auto mt-6 max-w-xl text-muted-foreground text-lg"
      >
        Experience the future of fitness with cutting-edge technology and
        personalized coaching designed to unlock your full potential.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <a
          href="#download"
          className="group relative inline-flex items-center gap-3 rounded-lg bg-secondary px-8 py-4 font-display text-sm tracking-widest text-white transition-colors hover:bg-secondary/90"
        >
          <Download size={18} />
          DOWNLOAD APP
        </a>
        <a
          href="#about"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-4 font-display text-sm tracking-widest text-white transition-colors hover:border-white/50 hover:text-white"
        >
          LEARN MORE
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="mt-16"
      >
        <ChevronDown size={28} className="mx-auto text-white/60 animate-float" />
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
