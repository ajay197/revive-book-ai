import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="sticky top-0 z-50 border-b bg-card/60 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
          <Phone className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-bold text-foreground">Lead Revival AI</span>
      </div>
      <div className="hidden items-center gap-8 md:flex">
        {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {item}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login">
          <Button variant="ghost" size="sm">Log in</Button>
        </Link>
        <a href="https://cal.com/appointment-booking/strategic-call" target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="bg-gradient-primary font-semibold shadow-glow">Start 500 Calls Trial</Button>
        </a>
      </div>
    </div>
  </nav>
);

export default Navbar;
