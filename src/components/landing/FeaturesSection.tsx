import { motion } from "framer-motion";
import { Phone, Upload, BarChart3, Calendar, Zap, Shield } from "lucide-react";

const features = [
  { icon: Upload, title: "CSV Lead Upload", desc: "Upload and map your lead lists in seconds. Built-in validation for phone numbers and emails.", accent: "from-blue-500/10 to-cyan-500/10" },
  { icon: Phone, title: "AI Voice Calling", desc: "Powered by Retell AI. Natural-sounding agents call your leads and book appointments automatically.", accent: "from-violet-500/10 to-purple-500/10" },
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Track answer rates, call durations, costs, sentiment, and appointment outcomes live.", accent: "from-emerald-500/10 to-teal-500/10" },
  { icon: Calendar, title: "Appointment Tracking", desc: "See every booked appointment, follow up on outcomes, and measure your ROI.", accent: "from-amber-500/10 to-orange-500/10" },
  { icon: Zap, title: "Campaign Automation", desc: "Set up campaigns in minutes. Define calling windows, assign agents, and launch with one click.", accent: "from-rose-500/10 to-pink-500/10" },
  { icon: Shield, title: "Multi-Tenant & Secure", desc: "Workspace-level data isolation. Perfect for agencies managing multiple clients.", accent: "from-indigo-500/10 to-blue-500/10" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const FeaturesSection = () => (
  <section id="features" className="py-16 sm:py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="text-center">
        <motion.span
          className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1 font-display text-xs font-semibold text-primary"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          Features
        </motion.span>
        <motion.h2
          className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Everything you need to convert leads
        </motion.h2>
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          One platform to upload leads, launch AI calling campaigns, and track every appointment and outcome.
        </motion.p>
      </div>
      <motion.div
        className="mt-10 grid gap-4 sm:mt-16 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-80px" }}
      >
        {features.map(({ icon: Icon, title, desc, accent }, i) => (
          <motion.div
            key={i}
            className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated sm:p-6"
            variants={cardVariant}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="relative">
              <motion.div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15"
                whileInView={{ rotate: [0, -10, 10, 0] }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
              >
                <Icon className="h-5 w-5 text-primary" />
              </motion.div>
              <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default FeaturesSection;
