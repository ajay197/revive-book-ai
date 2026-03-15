import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => (
  <section className="relative overflow-hidden bg-gradient-primary py-24">
    {/* Decorative circles */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full border border-white/10" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full border border-white/5" />
    </div>
    <div className="relative mx-auto max-w-3xl px-6 text-center">
      <motion.h2
        className="font-display text-3xl font-bold text-primary-foreground md:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Ready to revive your leads?
      </motion.h2>
      <motion.p
        className="mx-auto mt-4 max-w-xl text-primary-foreground/70"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Start converting old leads into booked appointments today. No credit card required.
      </motion.p>
      <motion.div
        className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="secondary" className="group px-8 text-base font-semibold">
            Start 500 Calls Trial
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </a>
        <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="ghost" className="px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10">
            Book a Demo
          </Button>
        </a>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
