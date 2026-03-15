import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Phone, CalendarCheck, DollarSign } from "lucide-react";
import { Slider } from "@/components/ui/slider";

function AnimatedValue({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
  return <span>{prefix}{display}{suffix}</span>;
}

const ROICalculator = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });

  const [leads, setLeads] = useState(500);
  const bookingRate = 0.05;
  const serviceValue = 10000;
  const closingRate = 0.05;

  const appointmentsBooked = Math.round(leads * bookingRate);
  const dealsClosed = leads * bookingRate * closingRate;
  const revenue = dealsClosed * serviceValue;

  const metrics = [
    { icon: Phone, label: "Leads Called", value: leads, prefix: "", suffix: "", color: "text-primary" },
    { icon: CalendarCheck, label: "Appointments Booked", value: appointmentsBooked, prefix: "", suffix: "", color: "text-success" },
    { icon: DollarSign, label: "Revenue Generated", value: revenue, prefix: "$", suffix: "", color: "text-warning" },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-64 w-64 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-success/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-4 py-1.5 font-display text-[11px] font-semibold text-success sm:text-xs">
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Revenue Calculator
          </span>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-5xl">
            See Your <span className="text-gradient">Potential Revenue</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Drag the slider to see how many appointments and revenue you could generate from your existing leads.
          </p>
        </motion.div>

        {/* Slider */}
        <motion.div
          className="mx-auto mt-10 max-w-md sm:mt-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>Leads to Call</span>
            <span className="font-display text-xl font-bold text-foreground tabular-nums">{leads.toLocaleString()}</span>
          </div>
          <Slider
            value={[leads]}
            onValueChange={([v]) => setLeads(v)}
            min={100}
            max={5000}
            step={100}
            className="mt-3"
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground/60">
            <span>100</span>
            <span>5,000</span>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              className="group relative overflow-hidden rounded-xl border bg-card p-5 text-center shadow-sm transition-all hover:shadow-md sm:p-6"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 transition-opacity group-hover:opacity-[0.03]" />
              <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted ${m.color}`}>
                <m.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-xs font-medium text-muted-foreground">{m.label}</p>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-foreground sm:text-3xl">
                <AnimatedValue value={m.value} prefix={m.prefix} suffix={m.suffix} />
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footnote */}
        <motion.p
          className="mt-6 text-center text-[11px] text-muted-foreground/50 sm:mt-8 sm:text-xs"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          Based on 5% appointment booking rate · $10,000 avg service value · 5% closing rate
        </motion.p>
      </div>
    </section>
  );
};

export default ROICalculator;
