"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import ContentService from "@/services/content.service";
import type { StaticContent } from "@/types/content";

interface Section {
  title: string;
  content: string;
}

function parseSections(raw: string): Section[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Section[];
  } catch {}
  return [{ title: "Content", content: raw }];
}

function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-brand-mid border border-brand-border rounded-xl px-6 py-4 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-[#9AD872]/10" />
            <div className="h-3 bg-brand-border rounded-full w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-brand-mid border border-rose-500/20 rounded-xl px-6 py-10 text-center">
      <p className="text-sm text-muted-foreground mb-4">
        Failed to load content. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="bg-[#9AD872] text-brand-dark font-display font-bold px-5 py-2.5 rounded-xl hover:bg-lime-400 transition-all text-sm"
      >
        RETRY
      </button>
    </div>
  );
}

function AccordionList({ sections }: { sections: Section[] }) {
  const [openSection, setOpenSection] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section, i) => (
        <div
          key={i}
          className="bg-brand-mid border border-brand-border rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenSection(openSection === i ? null : i)}
            className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:text-[#9AD872] transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-md bg-[#9AD872]/10 border border-[#9AD872]/20 text-[#9AD872] text-[10px] font-black flex items-center justify-center flex-shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-medium text-sm">{section.title}</span>
            </div>
            <span
              className={cn(
                "text-xl text-muted-foreground transition-transform duration-300 flex-shrink-0 leading-none",
                openSection === i && "rotate-45 text-[#9AD872]"
              )}
            >
              +
            </span>
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              openSection === i ? "max-h-96" : "max-h-0"
            )}
          >
            <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabContent({ queryKey }: { queryKey: "privacy" | "terms" }) {
  const { data, isLoading, isError, refetch } = useQuery<StaticContent>({
    queryKey: ["content", queryKey],
    queryFn: () =>
      queryKey === "privacy"
        ? ContentService.getPrivacy()
        : ContentService.getTerms(),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <SectionSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  const sections = parseSections(data.content);

  return (
    <>
      <p className="text-xs text-muted-foreground mb-8">
        Last updated:{" "}
        {new Date(data.updatedAt).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · Effective immediately upon publication
      </p>
      <AccordionList sections={sections} />
    </>
  );
}

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">("privacy");

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="bg-brand-mid border-b border-brand-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-[#9AD872]/10 text-[#9AD872] border border-[#9AD872]/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Legal
          </span>
          <h1 className="font-display font-black text-5xl sm:text-6xl leading-tight mb-4">
            PRIVACY &amp;
            <br />
            <span className="text-[#9AD872]">TERMS</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            We believe in transparency. Read how we collect, use, and protect
            your data, and understand the terms governing your use of SportPulse.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab switcher */}
        <div className="flex bg-brand-card rounded-xl p-1 mb-10 w-fit">
          {(["privacy", "terms"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab
                  ? "bg-brand-mid text-foreground border border-brand-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "privacy" ? "Privacy Policy" : "Terms of Service"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <TabContent key={activeTab} queryKey={activeTab} />

        {/* Contact CTA */}
        
      </div>
    </div>
  );
}