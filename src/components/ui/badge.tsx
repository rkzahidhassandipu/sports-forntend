import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "lime" | "teal" | "red" | "muted" | "blue";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "muted", children, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-block px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase",
      {
        "bg-lime-500/15 text-lime-500 border border-lime-500/20": variant === "lime",
        "bg-teal-500/15 text-teal-500 border border-teal-500/20": variant === "teal",
        "bg-red-500/15 text-red-400 border border-red-500/20": variant === "red",
        "bg-blue-500/15 text-blue-400 border border-blue-500/20": variant === "blue",
        "bg-brand-card text-muted-foreground border border-brand-border": variant === "muted",
      },
      className
    )}>
      {children}
    </span>
  );
}
