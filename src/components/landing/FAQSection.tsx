import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "How does AI calling work?", a: "Lead Revival AI uses advanced AI to make natural-sounding phone calls. You upload your leads, choose a calling AI agent and script, and launch a campaign. The AI handles the conversation and books appointments automatically via Cal.com." },
  { q: "What lead formats do you support?", a: "We accept CSV files with phone numbers. During upload, you can map columns to our fields. We validate phone numbers and emails automatically." },
  { q: "Can I use this for my agency clients?", a: "Yes. Our multi-tenant workspace system lets you manage multiple clients from one account. Each workspace has isolated data, campaigns, and analytics." },
  { q: "How do credits work?", a: "1 credit equals 2.5 minutes of AI calling. Credits are deducted after each completed call based on actual duration. Failed or unanswered calls are not charged. Choose from packs of 500, 2,100 (+5% bonus), or 6,000 (+20% bonus) credits." },
  { q: "How quickly can I launch my first campaign?", a: "Most users launch their first campaign within 5 minutes of signing up. Upload leads, pick an agent and script, set your calling window, and click launch." },
  { q: "What integrations are available?", a: "We integrate with Cal.com for appointment booking and scheduling, and support CSV lead imports. Facebook Leads, Zapier, and Make integrations are on our roadmap." },
];

const FAQSection = () => (
  <section id="faq" className="py-24">
    <div className="mx-auto max-w-3xl px-6">
      <div className="text-center">
        <motion.span
          className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1 font-display text-xs font-semibold text-primary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          FAQ
        </motion.span>
        <motion.h2
          className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Frequently asked questions
        </motion.h2>
      </div>
      <div className="mt-12 space-y-3">
        {faqs.map(({ q, a }, i) => (
          <motion.details
            key={i}
            className="group rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <summary className="flex cursor-pointer items-center justify-between font-display text-sm font-semibold text-foreground">
              {q}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
          </motion.details>
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection;
