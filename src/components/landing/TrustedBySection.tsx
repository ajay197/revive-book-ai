import { motion } from "framer-motion";

const RetellLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-1-2H7l3-5h2l-1 2h3l-3 5z" />
  </svg>
);

const CalComLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fillOpacity="0" stroke="currentColor" strokeWidth="2" />
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <rect x="7" y="13" width="3" height="3" rx="0.5" />
  </svg>
);

const OpenAILogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M22.28 9.37a5.99 5.99 0 00-.52-4.93 6.07 6.07 0 00-6.55-2.91A5.99 5.99 0 0010.69 0a6.07 6.07 0 00-5.8 4.27 5.99 5.99 0 00-4 2.9 6.07 6.07 0 00.75 7.12 5.99 5.99 0 00.52 4.93 6.07 6.07 0 006.55 2.91A5.99 5.99 0 0013.31 24a6.07 6.07 0 005.8-4.27 5.99 5.99 0 004-2.9 6.07 6.07 0 00-.75-7.12zM13.31 22.44a4.49 4.49 0 01-2.88-1.05l.14-.08 4.78-2.76a.77.77 0 00.39-.68v-6.74l2.02 1.17a.07.07 0 01.04.06v5.58a4.52 4.52 0 01-4.49 4.5zM3.58 18.29a4.49 4.49 0 01-.54-3.02l.14.08 4.78 2.76a.78.78 0 00.78 0l5.83-3.37v2.33a.07.07 0 01-.03.06l-4.83 2.79a4.52 4.52 0 01-6.13-1.63zM2.31 7.89a4.49 4.49 0 012.34-1.97V11.6a.77.77 0 00.39.68l5.83 3.37-2.02 1.17a.07.07 0 01-.07 0L3.96 14.03a4.52 4.52 0 01-1.65-6.14zm17.24 4.01l-5.83-3.37 2.02-1.17a.07.07 0 01.07 0l4.83 2.79a4.52 4.52 0 01-.7 8.14v-5.68a.77.77 0 00-.39-.68zM21.56 8.73l-.14-.08-4.78-2.76a.78.78 0 00-.78 0l-5.83 3.37V6.93a.07.07 0 01.03-.06l4.83-2.79a4.52 4.52 0 016.67 4.65zM8.64 13.31l-2.02-1.17a.07.07 0 01-.04-.06V6.5a4.52 4.52 0 017.37-3.49l-.14.08-4.78 2.76a.77.77 0 00-.39.68zm1.1-2.37l2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5z" />
  </svg>
);

const ClaudeLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M14.96 5.04L11.72 18.1h-2.4L6.07 5.04h2.46l2.16 9.6 2.16-9.6h2.11zm3.84 0L21.93 18.1h-2.28l-.72-3.12h-3.6l-.72 3.12h-2.16l3.12-13.06h3.23zm-.48 8.04l-1.32-5.76-1.32 5.76h2.64z" />
  </svg>
);

const GeminiLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 24A14.3 14.3 0 0 0 24 12 14.3 14.3 0 0 0 12 0 14.3 14.3 0 0 0 0 12a14.3 14.3 0 0 0 12 12z" />
  </svg>
);

const N8nLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M4.5 8a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zm8 8a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zM8 11.5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1v-1z" />
  </svg>
);

const MakeLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <circle cx="12" cy="12" r="10" fillOpacity="0" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const ElevenLabsLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <rect x="8" y="3" width="3" height="18" rx="1.5" />
    <rect x="13" y="3" width="3" height="18" rx="1.5" />
  </svg>
);

const TelnyxLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fillOpacity="0" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

const TwilioLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 0a12 12 0 100 24 12 12 0 000-24zm0 3.6a8.4 8.4 0 110 16.8 8.4 8.4 0 010-16.8zM9.3 9.3a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6zm5.4 0a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6zm-5.4 5.4a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6zm5.4 0a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6z" />
  </svg>
);

const ChatGPTLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M22.28 9.37a5.99 5.99 0 00-.52-4.93 6.07 6.07 0 00-6.55-2.91A5.99 5.99 0 0010.69 0a6.07 6.07 0 00-5.8 4.27 5.99 5.99 0 00-4 2.9 6.07 6.07 0 00.75 7.12 5.99 5.99 0 00.52 4.93 6.07 6.07 0 006.55 2.91A5.99 5.99 0 0013.31 24a6.07 6.07 0 005.8-4.27 5.99 5.99 0 004-2.9 6.07 6.07 0 00-.75-7.12z" />
  </svg>
);

const partners = [
  { name: "Retell AI", Logo: RetellLogo },
  { name: "Cal.com", Logo: CalComLogo },
  { name: "ChatGPT", Logo: ChatGPTLogo },
  { name: "Claude", Logo: ClaudeLogo },
  { name: "Gemini", Logo: GeminiLogo },
  { name: "n8n", Logo: N8nLogo },
  { name: "Make", Logo: MakeLogo },
  { name: "ElevenLabs", Logo: ElevenLabsLogo },
  { name: "OpenAI", Logo: OpenAILogo },
  { name: "Telnyx", Logo: TelnyxLogo },
  { name: "Twilio", Logo: TwilioLogo },
];

const TrustedBySection = () => (
  <section className="border-y border-border/40 bg-card/30 py-12">
    <div className="mx-auto max-w-6xl px-6 text-center">
      <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
        Our Integration Partners
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <motion.div
          className="flex items-center gap-14"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        >
          {[...partners, ...partners].map(({ name, Logo }, i) => (
            <span
              key={i}
              className="flex shrink-0 select-none items-center gap-2.5 text-foreground/20 transition-colors duration-300 hover:text-foreground/45"
            >
              <Logo />
              <span className="font-display text-base font-bold whitespace-nowrap">
                {name}
              </span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default TrustedBySection;
