import { motion } from "framer-motion";

import cosmeticSurgery from "@/assets/industries/cosmetic-surgery.jpg";
import medSpa from "@/assets/industries/med-spa.jpg";
import roofing from "@/assets/industries/roofing.jpg";
import solar from "@/assets/industries/solar.jpg";
import realEstate from "@/assets/industries/real-estate.jpg";
import hvac from "@/assets/industries/hvac.jpg";
import dental from "@/assets/industries/dental.jpg";
import legal from "@/assets/industries/legal.jpg";
import insurance from "@/assets/industries/insurance.jpg";
import marketing from "@/assets/industries/marketing.jpg";

const industries = [
  { name: "Cosmetic Surgery Clinics", image: cosmeticSurgery },
  { name: "Med Spas", image: medSpa },
  { name: "Roofing Companies", image: roofing },
  { name: "Solar Installers", image: solar },
  { name: "Real Estate Agents", image: realEstate },
  { name: "HVAC Companies", image: hvac },
  { name: "Dental Clinics", image: dental },
  { name: "Legal Firms", image: legal },
  { name: "Insurance Agencies", image: insurance },
  { name: "Marketing Agencies", image: marketing },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const IndustriesSection = () => (
  <section id="industries" className="py-16 sm:py-24 bg-card/30">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="text-center">
        <motion.span
          className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1 font-display text-xs font-semibold text-primary"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          Built For You
        </motion.span>
        <motion.h2
          className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Industries we serve
        </motion.h2>
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          From healthcare to home services — if your business books appointments, we help you fill the calendar.
        </motion.p>
      </div>

      <motion.div
        className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-5"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-80px" }}
      >
        {industries.map(({ name, image }) => (
          <motion.div
            key={name}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
            variants={item}
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <h3 className="font-display text-xs font-semibold leading-tight text-white sm:text-sm">
                  {name}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default IndustriesSection;
