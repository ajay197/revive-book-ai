import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Shield, Clock, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

function AnimatedNumber({ target, prefix = "", suffix = "", duration = 2000 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const animating = useRef(false);

  useEffect(() => {
    if (!isInView) {
      setValue(0);
      animating.current = false;
      return;
    }
    if (animating.current) return;
    animating.current = true;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(animate);
      else { setValue(target); animating.current = false; }
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  const hasDecimal = target % 1 !== 0;
  const display = hasDecimal ? value.toFixed(1) : Math.round(value).toLocaleString();

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

const barHeights = [35, 55, 40, 70, 48, 82, 62, 75, 55, 88, 68, 78, 60, 85];

const HeroSection = () => {
  const dashRef = useRef<HTMLDivElement>(null);
  const dashInView = useInView(dashRef, { once: false, margin: "-80px" });

  return (
    <section className="relative overflow-hidden pb-16 pt-20 sm:pb-20 sm:pt-28 md:pb-32 md:pt-40">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 -top-32 h-[300px] w-[300px] rounded-full opacity-[0.07] sm:h-[500px] sm:w-[500px]"
          style={{ background: "radial-gradient(circle, hsl(245 58% 51%), transparent 70%)" }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-32 h-[400px] w-[400px] rounded-full opacity-[0.05] sm:h-[600px] sm:w-[600px]"
          style={{ background: "radial-gradient(circle, hsl(270 67% 55%), transparent 70%)" }}
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(245 58% 51%) 1px, transparent 1px), linear-gradient(90deg, hsl(245 58% 51%) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 font-display text-[11px] font-semibold text-primary sm:px-4 sm:text-xs">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            AI-Powered Lead Reactivation
          </span>
        </motion.div>

        <motion.h1
          className="mx-auto mt-6 max-w-4xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:mt-8 sm:text-5xl md:text-7xl"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          Turn old leads into{" "}
          <span className="relative inline-block">
            <span className="text-gradient">booked appointments</span>
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-gradient-primary sm:-bottom-2 sm:h-[3px]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg md:text-xl"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          Upload your lead list, launch an AI calling campaign, and track appointments, outcomes, and cost — all in one simple dashboard.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="group w-full bg-gradient-primary px-8 text-base font-semibold shadow-elevated transition-all hover:shadow-glow hover:scale-[1.02] sm:w-auto"
            >
              Start 500 Calls Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
          <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full px-8 text-base font-semibold sm:w-auto">
              Book a Demo
            </Button>
          </a>
        </motion.div>

        <motion.div
          className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:mt-6 sm:gap-6"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
        >
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary/60" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary/60" /> Launch in 5 minutes
          </span>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          ref={dashRef}
          className="mx-auto mt-12 max-w-5xl sm:mt-20"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-primary opacity-[0.06] blur-2xl" />
            <div className="relative overflow-hidden rounded-xl border bg-card shadow-elevated">
              {/* Title bar */}
              <div className="flex h-9 items-center gap-2 border-b bg-muted/40 px-4">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/50" />
                <span className="ml-2 hidden text-[10px] font-medium text-muted-foreground sm:inline">Lead Revival AI — Dashboard</span>
              </div>

              {/* Stat cards with animated numbers */}
              <div className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-6 md:grid-cols-4">
                {[
                  { label: "Total Calls", target: 2847, prefix: "", suffix: "", change: "+12.3%", positive: true },
                  { label: "Answer Rate", target: 68.4, prefix: "", suffix: "%", change: "+3.2%", positive: true },
                  { label: "Booked", target: 312, prefix: "", suffix: "", change: "+18.7%", positive: true },
                  { label: "Total Cost", target: 2247, prefix: "$", suffix: "", change: "-4.1%", positive: false },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="rounded-lg border bg-background/50 p-3 text-left sm:p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={dashInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <p className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">{stat.label}</p>
                    <p className="mt-1 font-display text-lg font-bold text-foreground tabular-nums sm:text-xl md:text-2xl">
                      <AnimatedNumber target={stat.target} prefix={stat.prefix} suffix={stat.suffix} duration={1800} />
                    </p>
                    <p className={`mt-1 text-xs font-medium ${stat.positive ? "text-success" : "text-destructive"}`}>{stat.change}</p>
                  </motion.div>
                ))}
              </div>

              {/* Animated bar chart */}
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="flex h-24 items-end gap-1 rounded-lg bg-muted/20 p-3 sm:h-32 sm:gap-1.5 sm:p-4">
                  {barHeights.map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        background: "linear-gradient(to top, hsl(245 58% 51%), hsl(270 67% 65%))",
                      }}
                      initial={{ height: 0, opacity: 0 }}
                      animate={dashInView
                        ? { height: `${h}%`, opacity: 0.75 }
                        : { height: 0, opacity: 0 }
                      }
                      transition={{
                        delay: i * 0.06,
                        duration: 0.7,
                        ease: [0.34, 1.56, 0.64, 1], // spring-like bounce
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
