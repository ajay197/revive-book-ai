import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => (
  <section className="relative overflow-hidden bg-gradient-primary py-16 sm:py-24">
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute -left-20 -top-20 h-60 w-60 rounded-full border border-white/10 sm:h-80 sm:w-80"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full border border-white/5 sm:h-96 sm:w-96"
        animate={{ scale: [1, 1.05, 1], rotate: [0, -60, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
    <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
      <motion.h2
        className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl md:text-5xl"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        Ready to revive your leads?
      </motion.h2>
      <motion.p
        className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/70 sm:text-base"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-50px" }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        Start converting old leads into booked appointments today. No credit card required.
      </motion.p>
      <motion.div
        className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, margin: "-50px" }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
          <Button size="lg" variant="secondary" className="group w-full px-8 text-base font-semibold sm:w-auto">
            Start 500 Calls Trial
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </a>
        <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
          <Button size="lg" variant="ghost" className="w-full px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto">
            Book a Demo
          </Button>
        </a>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
