import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Upload Leads", desc: "Import your CSV lead list" },
  { step: "02", title: "Create Campaign", desc: "Choose type, agent, and script" },
  { step: "03", title: "Launch", desc: "Start calling with one click" },
  { step: "04", title: "AI Calls Leads", desc: "Natural AI voice conversations" },
  { step: "05", title: "Track Results", desc: "Monitor appointments & ROI" },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="relative overflow-hidden border-y bg-card/50 py-16 sm:py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="text-center">
        <motion.span
          className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1 font-display text-xs font-semibold text-primary"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          How It Works
        </motion.span>
        <motion.h2
          className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          From lead list to booked appointments
        </motion.h2>
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Five simple steps to turn your dormant leads into revenue.
        </motion.p>
      </div>
      <div className="relative mt-12 sm:mt-16">
        {/* Connecting line - desktop */}
        <motion.div
          className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />
        {/* Vertical line - mobile */}
        <motion.div
          className="absolute bottom-0 left-6 top-0 w-px bg-border md:hidden"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "top" }}
        />
        <div className="grid gap-6 sm:gap-8 md:grid-cols-5">
          {steps.map(({ step, title, desc }, i) => (
            <motion.div
              key={i}
              className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground shadow-glow"
                whileInView={{ scale: [0.8, 1.15, 1] }}
                viewport={{ once: false, margin: "-60px" }}
                transition={{ delay: i * 0.12 + 0.2, duration: 0.4 }}
              >
                {step}
              </motion.div>
              <div className="md:mt-5">
                <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
