import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Zap, Shield, TrendingUp } from "lucide-react";
import logoCircle from "@/assets/logo-circle.png";

const features = [
  { icon: Target, title: "PRECISION", desc: "AI-driven training plans tailored to your body and goals." },
  { icon: Zap, title: "PERFORMANCE", desc: "Real-time analytics to track every rep, set, and milestone." },
  { icon: Shield, title: "RECOVERY", desc: "Smart recovery protocols backed by sports science." },
  { icon: TrendingUp, title: "PROGRESS", desc: "Visualize your transformation with detailed progress tracking." },
];

const AnimatedCard = ({ icon: Icon, title, desc, index }: { icon: any; title: string; desc: string; index: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:glow-brand"
    >
      <div className="mb-4 inline-flex rounded-lg bg-gradient-brand p-3">
        <Icon size={22} className="text-primary-foreground" />
      </div>
      <h3 className="font-display text-base tracking-wider text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
};

const AboutSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          {/* Left – Image */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="hexagon-clip h-72 w-72 md:h-96 md:w-96 overflow-hidden border-2">
                <img
                  src={logoCircle}
                  alt="Kwoka Fitness"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -inset-4 hexagon-clip bg-gradient-brand opacity-20 blur-2xl -z-10" />
            </div>
          </motion.div>

          {/* Right – Text */}
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="font-display text-sm tracking-[0.3em] text-primary"
            >
              OUR STORY
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-3 font-display text-2xl md:text-4xl tracking-wider text-gradient"
            >
              KWOKA HISTORY
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-6 text-muted-foreground leading-relaxed max-w-lg"
            >
              Born from a passion for innovation and fitness, Kwoka Fitness
              merges cutting-edge technology with proven training methodologies.
              Our mission is to democratize elite-level coaching through an
              intelligent platform that adapts to every individual.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-4 text-muted-foreground leading-relaxed max-w-lg"
            >
              We believe that the future of personal training lies in the
              seamless integration of data-driven insights and human expertise,
              empowering you to reach heights you never thought possible.
            </motion.p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <AnimatedCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
