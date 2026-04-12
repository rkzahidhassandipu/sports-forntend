import Link from "next/link";

const FOOTER_LINKS = {
  "Quick Links": [
    { href: "/", label: "Home" },
    { href: "/sessions", label: "Explore Sessions" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  "Company": [
    { href: "/about", label: "About Us" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/privacy#terms", label: "Terms of Service" },
    { href: "/help", label: "Help & Support" },
    { href: "/about#careers", label: "Careers" },
  ],
  "Sports": [
    { href: "/sessions?sport=football", label: "Football" },
    { href: "/sessions?sport=swimming", label: "Swimming" },
    { href: "/sessions?sport=fitness", label: "Fitness & Gym" },
    { href: "/sessions?sport=boxing", label: "Boxing" },
    { href: "/sessions?sport=tennis", label: "Tennis" },
  ],
};

const SOCIAL = [
  { label: "Facebook", href: "https://facebook.com", icon: "f" },
  { label: "Instagram", href: "https://instagram.com", icon: "◎" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "in" },
  { label: "X", href: "https://x.com", icon: "✕" },
];

export function Footer() {
  return (
    <footer className="bg-brand-mid border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="font-display text-2xl font-black tracking-tight mb-4 block">
              SPORT<span className="text-lime-500">PULSE</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              Bangladesh's premier sports club management platform. Train smarter, compete harder, and unlock your peak performance with elite coaching.
            </p>
            <div className="flex gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-brand-card border border-brand-border flex items-center justify-center text-xs text-muted-foreground hover:text-lime-500 hover:border-lime-500/50 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h5 className="font-display font-bold text-sm tracking-widest uppercase mb-4 text-foreground">
                {title}
              </h5>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-lime-500 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact bar */}
        <div className="border-t border-brand-border pt-8 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-lime-500">✉</span>
            <a href="mailto:info@sportpulse.com.bd" className="hover:text-foreground transition-colors">
              info@sportpulse.com.bd
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-lime-500">☎</span>
            <a href="tel:+8801700123456" className="hover:text-foreground transition-colors">
              +880 1700-123456
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-lime-500">⊙</span>
            <span>123 Sports Complex, Mirpur, Dhaka-1216</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-brand-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 SportPulse Bangladesh. All rights reserved.
          </p>
          <div className="flex gap-4">
            {[
              { href: "/privacy", label: "Privacy" },
              { href: "/privacy#terms", label: "Terms" },
              { href: "/help", label: "Help" },
              { href: "/help#sitemap", label: "Sitemap" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-muted-foreground hover:text-lime-500 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
