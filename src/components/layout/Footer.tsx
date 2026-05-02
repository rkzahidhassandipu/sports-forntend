"use client";
import Link from "next/link";

const FOOTER_LINKS = {
  "Quick Links": [
    { href: "/",          label: "Home" },
    { href: "/sessions",  label: "Explore Sessions" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/blog",      label: "Blog" },
    { href: "/contact",   label: "Contact" },
  ],
  "Company": [
    { href: "/about",          label: "About Us" },
    { href: "/privacy",        label: "Privacy Policy" },
    { href: "/privacy#terms",  label: "Terms of Service" },
    { href: "/help",           label: "Help & Support" },
    { href: "/about#careers",  label: "Careers" },
  ],
  "Sports": [
    { href: "/sessions?sport=football", label: "Football" },
    { href: "/sessions?sport=swimming", label: "Swimming" },
    { href: "/sessions?sport=fitness",  label: "Fitness & Gym" },
    { href: "/sessions?sport=boxing",   label: "Boxing" },
    { href: "/sessions?sport=tennis",   label: "Tennis" },
  ],
};

const SOCIAL = [
  { label: "Facebook",  href: "https://facebook.com",  icon: "f" },
  { label: "Instagram", href: "https://instagram.com", icon: "◎" },
  { label: "LinkedIn",  href: "https://linkedin.com",  icon: "in" },
  { label: "X",         href: "https://x.com",         icon: "✕" },
];

export function Footer() {
  return (
    <footer style={{ background: "#162513", borderTop: "1px solid #2a3d22" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-display font-bold text-2xl tracking-tight mb-4 block"
              style={{ letterSpacing: "0.04em" }}
            >
              <span style={{ color: "#f0f7ec" }}>SPORT</span>
              <span style={{ color: "#9AD872" }}>PULSE</span>
            </Link>
            <p
              className="text-sm leading-relaxed max-w-xs mb-6"
              style={{ color: "#7a9c6e" }}
            >
              Bangladesh&apos;s premier sports club management platform. Train smarter,
              compete harder, and unlock your peak performance with elite coaching.
            </p>
            <div className="flex gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs transition-all duration-200 font-bold"
                  style={{
                    background: "#1c2f17",
                    border:     "1px solid #2a3d22",
                    color:      "#4a6b40",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color        = "#9AD872";
                    (e.currentTarget as HTMLElement).style.borderColor  = "rgba(154,216,114,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color        = "#4a6b40";
                    (e.currentTarget as HTMLElement).style.borderColor  = "#2a3d22";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h5
                className="font-display font-bold text-sm tracking-widest uppercase mb-4"
                style={{ color: "#FFEF91" }}
              >
                {title}
              </h5>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: "#7a9c6e" }}
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
        <div
          className="pt-8 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ borderTop: "1px solid #2a3d22" }}
        >
          {[
            { icon: "✉", href: "mailto:info@sportpulse.com.bd", text: "info@sportpulse.com.bd" },
            { icon: "☎", href: "tel:+8801700123456",            text: "+880 1700-123456" },
            { icon: "⊙", href: "#",                              text: "123 Sports Complex, Mirpur, Dhaka-1216" },
          ].map((c) => (
            <div key={c.text} className="flex items-center gap-3 text-sm" style={{ color: "#7a9c6e" }}>
              <span style={{ color: "#FFA02E" }}>{c.icon}</span>
              <a href={c.href} className="hover:text-[#f0f7ec] transition-colors">
                {c.text}
              </a>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: "1px solid #2a3d22" }}
        >
          <p className="text-xs" style={{ color: "#4a6b40" }}>
            © 2026 SportPulse Bangladesh. All rights reserved.
          </p>
          <div className="flex gap-4">
            {[
              { href: "/privacy",       label: "Privacy" },
              { href: "/privacy#terms", label: "Terms" },
              { href: "/help",          label: "Help" },
              { href: "/help#sitemap",  label: "Sitemap" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs transition-colors"
                style={{ color: "#4a6b40" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
