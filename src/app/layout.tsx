import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Oswald, Nunito } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/lib/providers";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SportPulse | Bangladesh Premier Sports Club",
    template: "%s | SportPulse",
  },
  description: "Bangladesh's premier sports club management platform.",
  keywords: ["SportPulse", "Bangladesh", "Sports Club", "Fitness", "Coaching"],


  icons: {
  icon: [
    {
      url: "https://res.cloudinary.com/djk8khbrv/image/upload/v1777822521/fitness-sport-gym-logo-design-vector_m0sttp.png",
      type: "image/png",
      sizes: "32x32",
    },
  ],
  apple: [
    {
      url: "https://res.cloudinary.com/djk8khbrv/image/upload/v1777822521/fitness-sport-gym-logo-design-vector_m0sttp.png",
      sizes: "180x180",
      type: "image/png",
    },
  ],
  shortcut: "https://res.cloudinary.com/djk8khbrv/image/upload/v1777822521/fitness-sport-gym-logo-design-vector_m0sttp.png",
}
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark", oswald.variable, nunito.variable)}
    >
      <body className="antialiased font-body bg-background text-foreground">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "#162513",
                border: "1px solid #2a3d22",
                color: "#f0f7ec",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
