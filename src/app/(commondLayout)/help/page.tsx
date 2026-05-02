"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const HELP_CATEGORIES = [
  {
    icon: "📅",
    title: "Booking & Sessions",
    articles: [
      "How to book a session",
      "How to cancel or reschedule",
      "Understanding session capacity",
      "Booking for someone else",
      "Group booking discounts",
    ],
  },
  {
    icon: "💳",
    title: "Payments & Billing",
    articles: [
      "Accepted payment methods",
      "Getting a refund",
      "Understanding your invoice",
      "Failed payment troubleshooting",
      "Membership pricing explained",
    ],
  },
  {
    icon: "👤",
    title: "Account & Profile",
    articles: [
      "Creating your account",
      "Changing your password",
      "Updating profile information",
      "Role-based access explained",
      "Deleting your account",
    ],
  },
  {
    icon: "📊",
    title: "Dashboard & Features",
    articles: [
      "Understanding your dashboard",
      "Reading fitness records",
      "Tracking your progress",
      "Coach vs Trainer roles",
      "Receptionist features",
    ],
  },
];

const POPULAR_FAQS = [
  { q: "How do I get started?", a: "Create a free account, choose your role (Member, Coach, or Trainer), and browse sessions. New members get a 7-day free trial with full access to all facilities." },
  { q: "Can I switch between roles?", a: "Role changes require admin approval. Contact support or your club administrator to request a role upgrade. Most role changes are processed within 24 hours." },
  { q: "What if I forget my password?", a: "Click 'Forgot password?' on the login page and enter your registered email. You'll receive a reset link within minutes. Check your spam folder if it doesn't arrive." },
  { q: "Are there fees for cancelling?", a: "No cancellation fees if you cancel 48+ hours before the session. Cancellations within 24–48 hours receive a 50% credit. Within 24 hours, no refund is issued." },
  { q: "How are fitness records tracked?", a: "Your assigned Trainer updates fitness records after each assessment session. You can view your full history in Dashboard → Fitness Records, with charts showing progress over time." },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filtered = POPULAR_FAQS.filter(
    (f) =>
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="bg-brand-mid border-b border-brand-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-[#9AD872]/10 text-[#9AD872] border border-[#9AD872]/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Help Center
          </span>
          <h1 className="font-display font-black text-5xl sm:text-6xl leading-tight mb-5">
            HOW CAN WE <span className="text-[#9AD872]">HELP?</span>
          </h1>
          {/* Search */}
          <div className="max-w-xl mx-auto flex items-center gap-3 bg-brand-card border border-brand-border rounded-2xl px-5 py-3.5 focus-within:border-[#9AD872] transition-all">
            <span className="text-muted-foreground">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help articles, FAQs..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground text-xs transition-colors">
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Help categories */}
        {!search && (
          <div className="mb-14">
            <h2 className="font-display font-bold text-2xl mb-6 tracking-wide">BROWSE BY TOPIC</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {HELP_CATEGORIES.map((cat) => (
                <div
                  key={cat.title}
                  className="bg-brand-mid border border-brand-border rounded-xl p-5 hover:border-[#9AD872]/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-lime-500/5 transition-all duration-200 cursor-pointer"
                >
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h3 className="font-display font-bold text-lg mb-3 tracking-wide">{cat.title.toUpperCase()}</h3>
                  <ul className="flex flex-col gap-2">
                    {cat.articles.map((article) => (
                      <li key={article}>
                        <button className="text-xs text-muted-foreground hover:text-[#9AD872] transition-colors text-left w-full leading-relaxed">
                          → {article}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        <div className="max-w-3xl">
          <h2 className="font-display font-bold text-2xl mb-6 tracking-wide">
            {search ? `RESULTS FOR "${search.toUpperCase()}"` : "POPULAR QUESTIONS"}
          </h2>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-muted-foreground text-sm mb-4">No results found. Try a different search term.</p>
              <button
                onClick={() => setSearch("")}
                className="text-[#9AD872] text-sm hover:text-lime-400 transition-colors"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((faq, i) => (
                <div key={i} className="bg-brand-mid border border-brand-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:text-[#9AD872] transition-colors duration-200"
                  >
                    <span className="text-sm font-medium">{faq.q}</span>
                    <span
                      className={cn(
                        "text-xl text-muted-foreground transition-transform duration-300 flex-shrink-0 leading-none",
                        openFaq === i && "rotate-45 text-[#9AD872]"
                      )}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      openFaq === i ? "max-h-48" : "max-h-0"
                    )}
                  >
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact support CTA */}
        <div className="mt-14 bg-gradient-to-br from-lime-500/8 to-teal-500/5 border border-[#9AD872]/15 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="font-display font-black text-3xl mb-3">
            STILL NEED <span className="text-[#9AD872]">HELP?</span>
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Our support team is available daily from 9 AM to 9 PM. We usually respond within 2 hours.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/contact"
              className="bg-[#9AD872] text-brand-dark font-display font-bold px-6 py-3 rounded-xl hover:bg-lime-400 transition-all duration-200 active:scale-95 tracking-wide text-sm"
            >
              CONTACT SUPPORT
            </Link>
            <a
              href="mailto:support@sportpulse.com.bd"
              className="border border-brand-border text-muted-foreground font-medium px-6 py-3 rounded-xl hover:border-[#9AD872]/50 hover:text-[#9AD872] transition-all duration-200 text-sm"
            >
              ✉ Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
