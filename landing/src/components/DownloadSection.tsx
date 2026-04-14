import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import badgeGooglePlay from "@/assets/badge-google-play.png";
import badgeAppStore from "@/assets/badge-app-store.png";

const DownloadSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="download"
      className="relative overflow-hidden border-t border-zinc-200/80 bg-white py-24 text-zinc-900 md:py-32"
    >
      <div ref={ref} className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left – Text & Badges */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-sm tracking-[0.3em] text-[hsl(180_65%_32%)]"
            >
              GET THE APP
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-3 font-display text-2xl tracking-wider text-zinc-950 md:text-4xl"
            >
              YOUR POCKET COACH
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mx-auto mt-6 max-w-lg leading-relaxed text-zinc-600 lg:mx-0"
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
                  className="h-40 w-auto"
                />
              </a>
              <a href="#" className="transition-transform hover:scale-105">
                <img
                  src={badgeGooglePlay}
                  alt="Get it on Google Play"
                  loading="lazy"
                  className="h-40 w-auto"
                />
              </a>
            </motion.div>
          </div>

          {/* Right – Device mock (image includes frame) */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="order-1 flex justify-center lg:order-2"
          >
            <img
              src="/mock2.png"
              alt="Kwoka Fitness app on iPhone — dashboard"
              loading="lazy"
              className="block h-auto max-h-[min(78vh,760px)] w-auto max-w-[min(360px,94vw)] md:max-w-[min(380px,42vw)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
