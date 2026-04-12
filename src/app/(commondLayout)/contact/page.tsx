"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-brand-mid border-b border-brand-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-lime-500/10 text-lime-500 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">Contact</span>
          <h1 className="font-display font-black text-5xl sm:text-6xl leading-tight">
            GET IN <span className="text-lime-500">TOUCH</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: "✉", title: "Email Us", value: "info@sportpulse.com.bd", sub: "We reply within 24 hours" },
                { icon: "☎", title: "Call Us", value: "+880 1700-123456", sub: "Daily 9 AM – 9 PM" },
                { icon: "⊙", title: "Visit Us", value: "123 Sports Complex", sub: "Mirpur, Dhaka-1216" },
                { icon: "🕐", title: "Opening Hours", value: "Daily 6 AM – 10 PM", sub: "365 days a year" },
              ].map((item) => (
                <div key={item.title} className="bg-brand-mid border border-brand-border rounded-xl p-5 hover:border-lime-500/30 transition-colors duration-200">
                  <div className="w-9 h-9 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500 mb-3 text-sm">{item.icon}</div>
                  <h3 className="font-display font-bold text-sm mb-1 tracking-wider uppercase">{item.title}</h3>
                  <p className="text-sm font-medium mb-0.5">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-lime-500/8 to-teal-500/5 border border-lime-500/15 rounded-xl p-6">
              <h3 className="font-display font-bold text-lg mb-3">FOLLOW US</h3>
              <div className="flex gap-3">
                {[
                  { icon: "f", label: "Facebook", href: "https://facebook.com" },
                  { icon: "◎", label: "Instagram", href: "https://instagram.com" },
                  { icon: "in", label: "LinkedIn", href: "https://linkedin.com" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-brand-card border border-brand-border flex items-center justify-center text-sm text-muted-foreground hover:text-lime-500 hover:border-lime-500/50 transition-all duration-200">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-brand-mid border border-brand-border rounded-xl p-7">
            <h2 className="font-display font-bold text-2xl mb-6">SEND A MESSAGE</h2>
            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="font-display font-bold text-xl mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm">We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {[
                  { key: "name" as const, label: "Your Name", type: "text", placeholder: "Full name" },
                  { key: "email" as const, label: "Email Address", type: "email", placeholder: "your@email.com" },
                  { key: "subject" as const, label: "Subject", type: "text", placeholder: "How can we help?" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-muted-foreground tracking-wider uppercase mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      required
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full bg-brand-card border border-brand-border text-foreground placeholder:text-muted-foreground/40 rounded-xl px-4 py-3 text-sm outline-none focus:border-lime-500 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground tracking-wider uppercase mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Your message..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-brand-card border border-brand-border text-foreground placeholder:text-muted-foreground/40 rounded-xl px-4 py-3 text-sm outline-none focus:border-lime-500 transition-all resize-none"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-lime-500 text-brand-dark font-display font-bold py-4 rounded-xl hover:bg-lime-400 transition-all duration-200 active:scale-95 tracking-wide disabled:opacity-60">
                  {loading ? "SENDING..." : "SEND MESSAGE"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
