import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Clock, Phone } from "lucide-react";

const packs = [
  { credits: "500 Credits", perCredit: "1,250 minutes of calling", price: "$500", promo: null },
  { credits: "2,100 Credits", perCredit: "5,250 minutes of calling · +5% bonus", price: "$2,000", promo: null },
  { credits: "6,000 Credits", perCredit: "15,000 minutes of calling · +20% bonus", price: "$5,000", promo: { label: "Most Popular", tag: "Best Value" } },
];

const includedFeatures = [
  "Unlimited CSV Lead Uploads",
  "AI Voice Calling Agents",
  "Cal.com Appointment Booking",
  "Real-Time Campaign Analytics",
  "Webhooks & API Access",
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
    className="relative overflow-hidden py-24"
    style={{ background: "linear-gradient(135deg, hsl(220 20% 8%), hsl(260 30% 12%), hsl(220 20% 8%))" }}
  >
    {/* Subtle glow orbs */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
    </div>

    <div className="relative mx-auto max-w-6xl px-6">
      <div className="text-center">
        <motion.h2
          className="font-display text-3xl font-extrabold text-white md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Pay Once, Use Forever
        </motion.h2>
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-white/50"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Credit-based pricing means no monthly subscriptions. Pay as you go — credits never expire. Full features with every plan.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer" className="mt-8 inline-block">
            <Button
              size="lg"
              className="group rounded-full border border-white/20 bg-white/5 px-10 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            >
              Start 500 Calls Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
        </motion.div>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {packs.map((pack, i) => (
            <motion.div
              key={i}
              className={`relative rounded-xl border p-5 transition-all hover:scale-[1.01] ${
                pack.promo
                  ? "border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
              }`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {pack.promo && (
                <div className="absolute -top-px left-0 right-0 flex items-center justify-between rounded-t-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1">
                  <span className="text-xs font-bold text-white">{pack.promo.label}</span>
                  <span className="text-xs font-semibold text-white/90">{pack.promo.tag}</span>
                </div>
              )}
              <div className={`flex items-center justify-between ${pack.promo ? "mt-4" : ""}`}>
                <div>
                  <p className="font-display text-lg font-bold text-white">{pack.credits}</p>
                  <p className="text-sm text-white/40">{pack.perCredit}</p>
                </div>
                <p className="font-display text-2xl font-extrabold text-white">{pack.price}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="rounded-xl border border-white/10 bg-white/[0.03] p-8"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="mb-6 font-display text-lg font-bold text-white">Included with all plans</h3>
          <ul className="space-y-4">
            {includedFeatures.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {badges.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <Icon className="h-4 w-4 shrink-0 text-white/40" />
                <span className="text-xs font-medium text-white/60">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default PricingSection;
