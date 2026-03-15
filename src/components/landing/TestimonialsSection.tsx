import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Sarah K.", role: "Owner, Valley Dental Group", quote: "We reactivated 2,400 old patient leads and booked 89 appointments in the first week. The ROI is insane.", stars: 5 },
  { name: "Marcus T.", role: "Agency Owner", quote: "I manage 12 clients on Lead Revival AI. The multi-tenant workspace feature saves me hours every day.", stars: 5 },
  { name: "Jennifer L.", role: "Marketing Director, SunState HVAC", quote: "Our Facebook leads used to go cold within hours. Now they get called within minutes of submitting the form.", stars: 5 },
];

const TestimonialsSection = () => (
  <section className="py-16 sm:py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="text-center">
        <motion.span
          className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1 font-display text-xs font-semibold text-primary"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          Testimonials
        </motion.span>
        <motion.h2
          className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Loved by businesses
        </motion.h2>
      </div>
      <div className="mt-10 grid gap-4 sm:mt-16 sm:gap-6 md:grid-cols-3">
        {testimonials.map(({ name, role, quote, stars }, i) => (
          <motion.div
            key={i}
            className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated sm:p-6"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-60px" }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
          >
            <Quote className="absolute -right-2 -top-2 h-16 w-16 text-primary/[0.04]" />
            <div className="mb-4 flex gap-0.5">
              {Array.from({ length: stars }).map((_, j) => (
                <motion.div
                  key={j}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, margin: "-40px" }}
                  transition={{ delay: i * 0.12 + j * 0.06 + 0.2, duration: 0.3 }}
                >
                  <Star className="h-4 w-4 fill-warning text-warning" />
                </motion.div>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-foreground">"{quote}"</p>
            <div className="mt-5 flex items-center gap-3 border-t pt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary font-display text-xs font-bold text-primary-foreground">
                {name.charAt(0)}
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
