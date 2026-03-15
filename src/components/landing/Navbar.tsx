import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = ["Features", "How It Works", "Pricing", "FAQ"];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Phone className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">Lead Revival AI</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Log in</Button>
          </Link>
          <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex">
            <Button size="sm" className="bg-gradient-primary font-semibold shadow-glow">Start Trial</Button>
          </a>
          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t bg-card md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t pt-3">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Log in</Button>
                </Link>
                <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="w-full bg-gradient-primary font-semibold shadow-glow">Start 500 Calls Trial</Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
