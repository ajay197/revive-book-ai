import { Phone } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-card py-12">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
      <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-2 cursor-pointer">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary">
          <Phone className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-display text-sm font-bold text-foreground">Lead Revival AI</span>
      </a>
      <p className="text-xs text-muted-foreground">© 2026 Lead Revival AI. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
