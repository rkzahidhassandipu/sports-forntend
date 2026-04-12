import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "teal" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-display font-700 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed tracking-wide",
        {
          "bg-lime-500 text-brand-dark hover:bg-lime-400 active:scale-95": variant === "primary",
          "border border-brand-border text-foreground hover:border-lime-500 hover:text-lime-500 bg-transparent": variant === "outline",
          "text-muted-foreground hover:text-foreground hover:bg-brand-card bg-transparent": variant === "ghost",
          "bg-teal-500 text-brand-dark hover:bg-teal-400 active:scale-95": variant === "teal",
          "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30": variant === "danger",
          "px-3 py-1.5 text-xs": size === "sm",
          "px-4 py-2.5 text-sm": size === "md",
          "px-6 py-3.5 text-base": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
