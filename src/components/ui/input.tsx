import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold text-muted-foreground mb-2 tracking-wider uppercase">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "w-full bg-brand-card border border-brand-border text-foreground placeholder:text-muted-foreground/50 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#9AD872] focus:ring-1 focus:ring-lime-500/30 transition-all",
            error && "border-red-500/50 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
