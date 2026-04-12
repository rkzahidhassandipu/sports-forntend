"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = {
  Privacy: [
    {
      title: "Information We Collect",
      content:
        "We collect information you provide directly: name, email address, phone number, date of birth, and payment details when you register or book a session. We also collect usage data including session history, fitness records, and platform interaction logs to improve our services.",
    },
    {
      title: "How We Use Your Information",
      content:
        "Your information is used to process bookings, manage your account, send session reminders, personalize your experience, and communicate relevant offers. We do not sell your personal data to third parties under any circumstances.",
    },
    {
      title: "Data Security",
      content:
        "All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Payment information is processed through PCI-DSS compliant payment providers. We conduct regular security audits and vulnerability assessments.",
    },
    {
      title: "Cookies & Tracking",
      content:
        "We use essential cookies for authentication and session management. Analytics cookies (opt-in) help us understand platform usage. You can manage cookie preferences from your account settings at any time.",
    },
    {
      title: "Your Rights",
      content:
        "You have the right to access, correct, or delete your personal data at any time. Requests can be submitted through your account settings or by emailing privacy@sportpulse.com.bd. We respond to all requests within 30 days.",
    },
    {
      title: "Contact & Updates",
      content:
        "For privacy-related questions, contact our Data Protection Officer at dpo@sportpulse.com.bd. This policy was last updated on April 1, 2026. Material changes will be communicated via email and platform notification.",
    },
  ],
  Terms: [
    {
      title: "Acceptance of Terms",
      content:
        "By creating an account or using SportPulse services, you agree to these Terms of Service. If you do not agree, please discontinue use of our platform. We may update these terms periodically — continued use constitutes acceptance of revised terms.",
    },
    {
      title: "Membership & Account",
      content:
        "You are responsible for maintaining the confidentiality of your account credentials. You must be 14 years or older to create an account. Users under 18 require parental consent. Each person may hold only one active account.",
    },
    {
      title: "Bookings & Cancellations",
      content:
        "Session bookings are confirmed upon payment. Cancellations made 48+ hours in advance receive a full refund. Cancellations within 24–48 hours receive a 50% credit. Cancellations within 24 hours of the session are non-refundable. No-shows forfeit the session fee.",
    },
    {
      title: "Code of Conduct",
      content:
        "Members must treat coaches, trainers, staff, and fellow members with respect. Inappropriate behaviour, harassment, or misuse of facilities may result in immediate account suspension. SportPulse reserves the right to terminate accounts for violations.",
    },
    {
      title: "Health & Safety",
      content:
        "You participate in all sessions at your own risk. You represent that you are physically capable of participating in your chosen activities. Consult a physician before beginning any new fitness program. SportPulse is not liable for injuries sustained during sessions.",
    },
    {
      title: "Intellectual Property",
      content:
        "All content on the SportPulse platform — including training programs, coaching materials, and media — is owned by SportPulse or its licensors. Reproduction, distribution, or commercial use without written consent is strictly prohibited.",
    },
  ],
};

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState<"Privacy" | "Terms">("Privacy");
  const [openSection, setOpenSection] = useState<number | null>(0);

  const sections = SECTIONS[activeTab];

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="bg-brand-mid border-b border-brand-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-lime-500/10 text-lime-500 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Legal
          </span>
          <h1 className="font-display font-black text-5xl sm:text-6xl leading-tight mb-4">
            PRIVACY &<br />
            <span className="text-lime-500">TERMS</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            We believe in transparency. Read how we collect, use, and protect your data, and understand the terms governing your use of SportPulse.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab switcher */}
        <div className="flex bg-brand-card rounded-xl p-1 mb-10 w-fit">
          {(["Privacy", "Terms"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setOpenSection(0); }}
              className={cn(
                "px-8 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab
                  ? "bg-brand-mid text-foreground border border-brand-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "Privacy" ? "Privacy Policy" : "Terms of Service"}
            </button>
          ))}
        </div>

        {/* Last updated */}
        <p className="text-xs text-muted-foreground mb-8">
          Last updated: April 1, 2026 · Effective immediately upon publication
        </p>

        {/* Sections accordion */}
        <div className="flex flex-col gap-3">
          {sections.map((section, i) => (
            <div
              key={i}
              className="bg-brand-mid border border-brand-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenSection(openSection === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:text-lime-500 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-lime-500/10 border border-lime-500/20 text-lime-500 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium text-sm">{section.title}</span>
                </div>
                <span
                  className={cn(
                    "text-xl text-muted-foreground transition-transform duration-300 flex-shrink-0 leading-none",
                    openSection === i && "rotate-45 text-lime-500"
                  )}
                >
                  +
                </span>
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openSection === i ? "max-h-60" : "max-h-0"
                )}
              >
                <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 p-6 bg-brand-mid border border-brand-border rounded-xl">
          <h3 className="font-display font-bold text-lg mb-2">QUESTIONS ABOUT THIS POLICY?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you have questions about our Privacy Policy or Terms of Service, our legal team is happy to help.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="mailto:legal@sportpulse.com.bd"
              className="bg-lime-500 text-brand-dark font-display font-bold px-5 py-2.5 rounded-xl hover:bg-lime-400 transition-all duration-200 text-sm tracking-wide"
            >
              CONTACT LEGAL TEAM
            </a>
            <a
              href="mailto:dpo@sportpulse.com.bd"
              className="border border-brand-border text-muted-foreground px-5 py-2.5 rounded-xl hover:border-lime-500/50 hover:text-lime-500 transition-all duration-200 text-sm"
            >
              Data Protection Officer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
