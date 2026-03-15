import { motion } from "framer-motion";

const logos = ["Apex Plumbing", "Valley Dental Group", "SunState HVAC", "Premier Roofing", "Bright Smile Dental", "Desert Electric Co."];

const TrustedBySection = () => (
  <section className="border-y bg-card/50 py-10">
    <div className="mx-auto max-w-6xl px-6 text-center">
      <p className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground/60">Trusted by 500+ businesses and agencies</p>
      <div className="relative overflow-hidden">
        <motion.div
          className="flex items-center gap-12"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...logos, ...logos].map((name, i) => (
            <span key={i} className="shrink-0 font-display text-lg font-semibold text-foreground/25 transition-colors hover:text-foreground/40">
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default TrustedBySection;
