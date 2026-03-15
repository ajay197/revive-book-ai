import { motion } from "framer-motion";

const partners = [
  "Retell AI",
  "Cal.com",
  "ChatGPT",
  "Claude",
  "Gemini",
  "n8n",
  "Make",
  "ElevenLabs",
  "OpenAI",
  "Telnyx",
  "Twilio",
];

const TrustedBySection = () => (
  <section className="border-y border-border/40 bg-card/30 py-12">
    <div className="mx-auto max-w-6xl px-6 text-center">
      <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
        Our Integration Partners
      </p>
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <motion.div
          className="flex items-center gap-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...partners, ...partners].map((name, i) => (
            <span
              key={i}
              className="shrink-0 select-none font-display text-lg font-bold text-foreground/20 transition-colors duration-300 hover:text-foreground/40"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default TrustedBySection;
