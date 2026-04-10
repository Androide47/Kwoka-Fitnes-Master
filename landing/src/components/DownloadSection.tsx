import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import phoneMockup from "@/assets/phone-mockup.png";
import badgeGooglePlay from "@/assets/badge-google-play.png";
import badgeAppStore from "@/assets/badge-app-store.png";

const DownloadSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="download" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[150px]" />

      <div ref={ref} className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left – Text & Badges */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-sm tracking-[0.3em] text-primary"
            >
              GET THE APP
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-3 font-display text-2xl md:text-4xl tracking-wider text-gradient"
            >
              YOUR POCKET COACH
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              Download the Kwoka Fitness app and take your training anywhere.
              AI-powered workouts, real-time tracking, and personalized
              recovery — all in the palm of your hand.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <a href="#" className="transition-transform hover:scale-105">
                <img
                  src={badgeAppStore}
                  alt="Download on the App Store"
                  loading="lazy"
                  className="h-20 w-auto"
                />
              </a>
              <a href="#" className="transition-transform hover:scale-105">
                <img
                  src={badgeGooglePlay}
                  alt="Get it on Google Play"
                  loading="lazy"
                  className="h-20 w-auto"
                />
              </a>
            </motion.div>
          </div>

          {/* Right – Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center order-1 lg:order-2"
          >
            <div className="relative">
              <img
                src={phoneMockup}
                alt="Kwoka Fitness App"
                loading="lazy"
                className="h-[500px] md:h-[650px] w-auto drop-shadow-2xl"
              />
              <div className="absolute -inset-8 bg-gradient-brand opacity-10 blur-3xl rounded-full -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
