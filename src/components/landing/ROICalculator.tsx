import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Phone, CalendarCheck, DollarSign, Percent, BadgeDollarSign } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const ROICalculator = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });

  const [leads, setLeads] = useState(500);
  const [bookingRate, setBookingRate] = useState(5);
  const [serviceValue, setServiceValue] = useState(10000);
  const [closingRate, setClosingRate] = useState(5);

  const appointmentsBooked = Math.round(leads * (bookingRate / 100));
  const dealsClosed = leads * (bookingRate / 100) * (closingRate / 100);
  const revenue = dealsClosed * serviceValue;

  const metrics = [
    { icon: Phone, label: "Leads Called", value: leads.toLocaleString(), color: "text-primary" },
    { icon: CalendarCheck, label: "Appointments Booked", value: appointmentsBooked.toLocaleString(), color: "text-success" },
    { icon: DollarSign, label: "Revenue Generated", value: `$${Math.round(revenue).toLocaleString()}`, color: "text-warning" },
  ];

  const controls = [
    { label: "Leads to Call", value: leads, setter: setLeads, min: 100, max: 5000, step: 100, display: leads.toLocaleString(), icon: Phone },
    { label: "Booking Rate", value: bookingRate, setter: setBookingRate, min: 1, max: 30, step: 1, display: `${bookingRate}%`, icon: Percent },
    { label: "Avg Service Value", value: serviceValue, setter: setServiceValue, min: 1000, max: 50000, step: 500, display: `$${serviceValue.toLocaleString()}`, icon: BadgeDollarSign },
    { label: "Closing Rate", value: closingRate, setter: setClosingRate, min: 1, max: 30, step: 1, display: `${closingRate}%`, icon: TrendingUp },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden py-12 sm:py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-40 w-40 rounded-full bg-primary/5 blur-[80px] sm:h-64 sm:w-64 sm:blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-success/5 blur-[60px] sm:h-48 sm:w-48 sm:blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-3 py-1 font-display text-[10px] font-semibold text-success sm:gap-2 sm:px-4 sm:py-1.5 sm:text-xs">
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Revenue Calculator
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-xl font-extrabold tracking-tight text-foreground sm:mt-4 sm:text-3xl md:text-5xl">
            See Your <span className="text-gradient">Potential Revenue</span>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground sm:mt-3 sm:text-sm md:text-base">
            Adjust the sliders to see how many appointments and revenue you could generate from your existing leads.
          </p>
        </motion.div>

        {/* Controls Grid */}
        <motion.div
          className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-5 md:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {controls.map((c) => (
            <div key={c.label} className="rounded-lg border bg-card p-3 shadow-sm sm:rounded-xl sm:p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:gap-2 sm:text-sm">
                  <c.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {c.label}
                </span>
                <span className="font-display text-base font-bold tabular-nums text-foreground sm:text-lg">{c.display}</span>
              </div>
              <Slider
                value={[c.value]}
                onValueChange={([v]) => c.setter(v)}
                min={c.min}
                max={c.max}
                step={c.step}
                className="mt-2.5 sm:mt-3"
              />
              <div className="mt-1 flex justify-between text-[9px] text-muted-foreground/50 sm:text-[10px]">
                <span>{c.min.toLocaleString()}{c.label.includes("Rate") ? "%" : ""}</span>
                <span>{c.max.toLocaleString()}{c.label.includes("Rate") ? "%" : ""}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Metric Cards */}
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              className="group relative overflow-hidden rounded-lg border bg-card p-4 text-center shadow-sm transition-all hover:shadow-md sm:rounded-xl sm:p-6"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 transition-opacity group-hover:opacity-[0.03]" />
              <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-muted sm:h-10 sm:w-10 ${m.color}`}>
                <m.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="mt-2 text-[10px] font-medium text-muted-foreground sm:mt-3 sm:text-xs">{m.label}</p>
              <p className="mt-0.5 font-display text-xl font-extrabold tabular-nums text-foreground sm:mt-1 sm:text-2xl md:text-3xl">
                {m.value}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-4 text-center text-[10px] text-muted-foreground/50 sm:mt-8 sm:text-xs"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          Adjust the values above to match your business · Results update in real-time
        </motion.p>
      </div>
    </section>
  );
};

export default ROICalculator;
