// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { Jost, Geist } from 'next/font/google';
import { cn } from "@/lib/utils";
import { Providers } from '@/lib/providers';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Primary font via Next.js font optimization
const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SportPulse | Where the Sea Meets club',
    template: '%s | SportPulse',
  },
  description:
    "Bangladesh's most iconic overwater resort in jessore.",
  keywords: ['SportPulse', 'jessore', 'Resort', 'Water Chalets', 'Villas', 'Suites'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(jost.className, "font-sans", geist.variable)}>
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}