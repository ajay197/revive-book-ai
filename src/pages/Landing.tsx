import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Phone, Upload, BarChart3, Calendar, Zap, Shield, Clock, Star, ChevronDown } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

const Landing = () => {
  const { user, isReady } = useAuth();

  if (isReady && user) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">Lead Revival AI</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How It Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
              <Button size="sm">Start 500 Calls Trial</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(245_58%_51%_/_0.05),_transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 font-display text-xs font-semibold">
              AI-Powered Lead Reactivation
            </Badge>
          </motion.div>
          <motion.h1
            className="mx-auto max-w-4xl font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl md:leading-[1.1]"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            Turn old leads into{" "}
            <span className="text-gradient">booked appointments</span>{" "}
            with AI calling
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Upload your lead list, launch an AI calling campaign, and track appointments, outcomes, and cost — all in one simple dashboard.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-primary px-8 text-base font-semibold shadow-elevated transition-shadow hover:shadow-glow">
                Start 500 Calls Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="px-8 text-base font-semibold">
                Book a Demo
              </Button>
            </a>
          </motion.div>
          <motion.div
            className="mx-auto mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground"
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
          >
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> No credit card required</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Launch in 5 minutes</span>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-xl border bg-card shadow-elevated"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <div className="flex h-8 items-center gap-2 border-b bg-muted/50 px-4">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/40" />
            </div>
            <div className="grid grid-cols-4 gap-4 p-6">
              {[
                { label: "Total Calls", value: "2,847", change: "+12.3%" },
                { label: "Answer Rate", value: "68.4%", change: "+3.2%" },
                { label: "Booked", value: "312", change: "+18.7%" },
                { label: "Total Cost", value: "$2,247.83", change: "-4.1%" },
              ].map((stat, i) => (
                <div key={i} className="rounded-lg border bg-card p-4 text-left">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs text-success">{stat.change}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="h-32 rounded-lg bg-muted/30" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-y bg-card py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="mb-8 text-sm font-medium text-muted-foreground">Trusted by 500+ businesses and agencies</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-40">
            {["Apex Plumbing", "Valley Dental Group", "SunState HVAC", "Premier Roofing", "Bright Smile Dental", "Desert Electric Co."].map((name) => (
              <span key={name} className="font-display text-lg font-semibold text-foreground">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 font-display text-xs font-semibold">Features</Badge>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Everything you need to convert leads</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">One platform to upload leads, launch AI calling campaigns, and track every appointment and outcome.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Upload, title: "CSV Lead Upload", desc: "Upload and map your lead lists in seconds. Built-in validation for phone numbers and emails." },
              { icon: Phone, title: "AI Voice Calling", desc: "Powered by Retell AI. Natural-sounding agents call your leads and book appointments automatically." },
              { icon: BarChart3, title: "Real-Time Analytics", desc: "Track answer rates, call durations, costs, sentiment, and appointment outcomes live." },
              { icon: Calendar, title: "Appointment Tracking", desc: "See every booked appointment, follow up on outcomes, and measure your ROI." },
              { icon: Zap, title: "Campaign Automation", desc: "Set up campaigns in minutes. Define calling windows, assign agents, and launch with one click." },
              { icon: Shield, title: "Multi-Tenant & Secure", desc: "Workspace-level data isolation. Perfect for agencies managing multiple clients." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                className="group rounded-xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-y bg-card py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 font-display text-xs font-semibold">How It Works</Badge>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">From lead list to booked appointments</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Five simple steps to turn your dormant leads into revenue.</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-5">
            {[
              { step: "01", title: "Upload Leads", desc: "Import your CSV lead list" },
              { step: "02", title: "Create Campaign", desc: "Choose type, agent, and script" },
              { step: "03", title: "Launch", desc: "Start calling with one click" },
              { step: "04", title: "AI Calls Leads", desc: "Natural AI voice conversations" },
              { step: "05", title: "Track Results", desc: "Monitor appointments & ROI" },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground">
                  {step}
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 font-display text-xs font-semibold">Testimonials</Badge>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Loved by businesses</h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { name: "Sarah K.", role: "Owner, Valley Dental Group", quote: "We reactivated 2,400 old patient leads and booked 89 appointments in the first week. The ROI is insane.", stars: 5 },
              { name: "Marcus T.", role: "Agency Owner", quote: "I manage 12 clients on Lead Revival AI. The multi-tenant workspace feature saves me hours every day.", stars: 5 },
              { name: "Jennifer L.", role: "Marketing Director, SunState HVAC", quote: "Our Facebook leads used to go cold within hours. Now they get called within minutes of submitting the form.", stars: 5 },
            ].map(({ name, role, quote, stars }, i) => (
              <motion.div
                key={i}
                className="rounded-xl border bg-card p-6 shadow-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground">"{quote}"</p>
                <div className="mt-4 border-t pt-4">
                  <p className="font-display text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y bg-card py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 font-display text-xs font-semibold">Full Transparency</Badge>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
              No Platform Fees.{" "}
              <span className="text-gradient">Pay Only For What You Use</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Treat Lead Revival AI like your outsourced call center.</p>
          </div>

          <div className="mx-auto mt-16 max-w-md">
            <div className="rounded-2xl border bg-background p-8 shadow-card">
              <h3 className="font-display text-2xl font-bold text-foreground">Pay as you go</h3>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-muted-foreground">$0 to start.</p>
                <p className="text-sm font-medium text-foreground">Self-Serve</p>
                <p className="text-sm text-muted-foreground">Start instantly.</p>
              </div>

              <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer" className="mt-6 block">
                <Button variant="outline" size="lg" className="w-full rounded-full text-base font-semibold">
                  Start 500 Calls Trial
                </Button>
              </a>

              <div className="mt-8 border-t pt-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</p>
                <ul className="space-y-4">
                  {[
                    { icon: Phone, text: "$0.07+/minute for AI Voice Agents" },
                    { icon: Zap, text: "1 credit = 2.5 minutes of calling" },
                    { icon: Upload, text: "Unlimited CSV Lead Uploads" },
                    { icon: BarChart3, text: "Real-Time Analytics" },
                    { icon: Calendar, text: "Cal.com Appointment Booking" },
                  ].map(({ icon: Icon, text }, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 font-display text-xs font-semibold">FAQ</Badge>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Frequently asked questions</h2>
          </div>
          <div className="mt-12 space-y-4">
            {[
              { q: "How does AI calling work?", a: "Lead Revival AI uses advanced AI to make natural-sounding phone calls. You upload your leads, choose a calling AI agent and script, and launch a campaign. The AI handles the conversation and books appointments automatically via Cal.com." },
              { q: "What lead formats do you support?", a: "We accept CSV files with phone numbers. During upload, you can map columns to our fields. We validate phone numbers and emails automatically." },
              { q: "Can I use this for my agency clients?", a: "Yes. Our multi-tenant workspace system lets you manage multiple clients from one account. Each workspace has isolated data, campaigns, and analytics." },
              { q: "How do credits work?", a: "1 credit equals 2.5 minutes of AI calling. Credits are deducted after each completed call based on actual duration. Failed or unanswered calls are not charged. Choose from packs of 500, 2,000 (+5% bonus), or 5,000 (+10% bonus) credits." },
              { q: "How quickly can I launch my first campaign?", a: "Most users launch their first campaign within 5 minutes of signing up. Upload leads, pick an agent and script, set your calling window, and click launch." },
              { q: "What integrations are available?", a: "We integrate with Cal.com for appointment booking and scheduling, and support CSV lead imports. Facebook Leads, Zapier, and Make integrations are on our roadmap." },
            ].map(({ q, a }, i) => (
              <details key={i} className="group rounded-xl border bg-card p-5 shadow-card">
                <summary className="flex cursor-pointer items-center justify-between font-display text-sm font-semibold text-foreground">
                  {q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-primary py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">Ready to revive your leads?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">Start converting old leads into booked appointments today. No credit card required.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="px-8 text-base font-semibold">
                Start 500 Calls Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="ghost" className="px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10">
                Book a Demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary">
              <Phone className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-bold text-foreground">Lead Revival AI</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Lead Revival AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
