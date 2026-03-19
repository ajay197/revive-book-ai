import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Clock, Phone } from "lucide-react";

const packs = [
  { credits: "1,000 Credits", perCredit: "1,000 minutes of calling", price: "$500", promo: null },
  { credits: "2,200 Credits", perCredit: "2,200 minutes of calling · +10% bonus", price: "$1,000", promo: { label: "Most Popular", tag: "Best Value" } },
  { credits: "15,000 Credits", perCredit: "15,000 minutes of calling · +50% bonus", price: "$5,000", promo: null },
];

const includedFeatures = [
  "Unlimited CSV Lead Uploads",
  "AI Voice Calling Agents",
  "Cal.com Appointment Booking",
  "Real-Time Campaign Analytics",
  "Webhooks & API Access",
  "Generate New Leads via Meta Ads",
  "Call New Leads Within 60 Seconds",
];

const badges = [
  { icon: Shield, text: "No Monthly Cost" },
  { icon: Zap, text: "Usage Based Cost" },
  { icon: Clock, text: "Credit Card Free" },
  { icon: Phone, text: "1 Credit = 2.5 Min" },
];

const PricingSection = () => (
  <section
    id="pricing"
    className="relative overflow-hidden py-16 sm:py-24"
    style={{ background: "linear-gradient(135deg, hsl(220 20% 8%), hsl(260 30% 12%), hsl(220 20% 8%))" }}
  >
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/4 top-1/4 h-48 w-48 rounded-full bg-purple-500/10 blur-[100px] sm:h-64 sm:w-64" />
      <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-blue-500/10 blur-[100px] sm:h-64 sm:w-64" />
    </div>

    <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
      <div className="text-center">
        <motion.h2
          className="font-display text-2xl font-extrabold text-white sm:text-3xl md:text-5xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          Pay Once, Use Forever
        </motion.h2>
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-sm text-white/50 sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          Credit-based pricing means no monthly subscriptions. Pay as you go — credits never expire. Full features with every plan.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer" className="mt-8 inline-block">
            <Button
              size="lg"
              className="group rounded-full border border-white/20 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] sm:px-10 sm:text-base"
            >
              Start 1,000 Calls Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
        </motion.div>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:mt-16 sm:gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {packs.map((pack, i) => (
            <motion.div
              key={i}
              className={`relative rounded-xl border p-4 transition-all hover:scale-[1.01] sm:p-5 ${
                pack.promo
                  ? "border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
              }`}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
            >
              {pack.promo && (
                <div className="absolute -top-px left-0 right-0 flex items-center justify-between rounded-t-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1">
                  <span className="text-xs font-bold text-white">{pack.promo.label}</span>
                  <span className="text-xs font-semibold text-white/90">{pack.promo.tag}</span>
                </div>
              )}
              <div className={`flex items-center justify-between gap-4 ${pack.promo ? "mt-4" : ""}`}>
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-white sm:text-lg">{pack.credits}</p>
                  <p className="truncate text-xs text-white/40 sm:text-sm">{pack.perCredit}</p>
                </div>
                <p className="shrink-0 font-display text-xl font-extrabold text-white sm:text-2xl">{pack.price}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="mb-5 font-display text-base font-bold text-white sm:mb-6 sm:text-lg">Included with all plans</h3>
          <ul className="space-y-3 sm:space-y-4">
            {includedFeatures.map((feature, i) => (
              <motion.li
                key={i}
                className="flex items-center gap-3 text-sm text-white/70"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {feature}
              </motion.li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3">
            {badges.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 sm:px-3 sm:py-2.5"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, margin: "-40px" }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-white/40 sm:h-4 sm:w-4" />
                <span className="text-[11px] font-medium text-white/60 sm:text-xs">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default PricingSection;
