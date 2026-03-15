import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Upload Leads", desc: "Import your CSV lead list" },
  { step: "02", title: "Create Campaign", desc: "Choose type, agent, and script" },
  { step: "03", title: "Launch", desc: "Start calling with one click" },
  { step: "04", title: "AI Calls Leads", desc: "Natural AI voice conversations" },
  { step: "05", title: "Track Results", desc: "Monitor appointments & ROI" },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="relative overflow-hidden border-y bg-card/50 py-24">
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center">
        <motion.span
          className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1 font-display text-xs font-semibold text-primary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.span>
        <motion.h2
          className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          From lead list to booked appointments
        </motion.h2>
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Five simple steps to turn your dormant leads into revenue.
        </motion.p>
      </div>
      <div className="relative mt-16">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block" />
        <div className="grid gap-8 md:grid-cols-5">
          {steps.map(({ step, title, desc }, i) => (
            <motion.div
              key={i}
              className="relative text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground shadow-glow">
                {step}
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
