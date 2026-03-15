import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

const HeroSection = () => (
  <section className="relative overflow-hidden pb-20 pt-28 md:pb-32 md:pt-40">
    {/* Animated gradient orbs */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, hsl(245 58% 51%), transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, hsl(270 67% 55%), transparent 70%)" }}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(245 58% 51%) 1px, transparent 1px), linear-gradient(90deg, hsl(245 58% 51%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>

    <div className="relative mx-auto max-w-6xl px-6 text-center">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-display text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Lead Reactivation
        </span>
      </motion.div>

      <motion.h1
        className="mx-auto mt-8 max-w-4xl font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-7xl"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
      >
        Turn old leads into{" "}
        <span className="relative inline-block">
          <span className="text-gradient">booked appointments</span>
          <motion.span
            className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full bg-gradient-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
          />
        </span>
      </motion.h1>

      <motion.p
        className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={2}
      >
        Upload your lead list, launch an AI calling campaign, and track appointments, outcomes, and cost — all in one simple dashboard.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={3}
      >
        <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
          <Button
            size="lg"
            className="group bg-gradient-primary px-8 text-base font-semibold shadow-elevated transition-all hover:shadow-glow hover:scale-[1.02]"
          >
            Start 500 Calls Trial
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </a>
        <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="lg" className="px-8 text-base font-semibold">
            Book a Demo
          </Button>
        </a>
      </motion.div>

      <motion.div
        className="mx-auto mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground"
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
        className="mx-auto mt-20 max-w-5xl"
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative">
          {/* Glow behind card */}
          <div className="absolute -inset-4 rounded-2xl bg-gradient-primary opacity-[0.06] blur-2xl" />
          <div className="relative overflow-hidden rounded-xl border bg-card shadow-elevated">
            <div className="flex h-9 items-center gap-2 border-b bg-muted/40 px-4">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/50" />
              <span className="ml-2 text-[10px] font-medium text-muted-foreground">Lead Revival AI — Dashboard</span>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
              {[
                { label: "Total Calls", value: "2,847", change: "+12.3%", positive: true },
                { label: "Answer Rate", value: "68.4%", change: "+3.2%", positive: true },
                { label: "Booked", value: "312", change: "+18.7%", positive: true },
                { label: "Total Cost", value: "$2,247", change: "-4.1%", positive: true },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="rounded-lg border bg-background/50 p-4 text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                >
                  <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-success">{stat.change}</p>
                </motion.div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="flex h-28 items-end gap-1 rounded-lg bg-muted/20 p-4">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-primary opacity-60"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1.2 + i * 0.05, duration: 0.6, ease: "easeOut" }}
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

export default HeroSection;
