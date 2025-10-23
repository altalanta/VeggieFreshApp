import { cn } from "@/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";

export interface VeggieButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "default" | "sm" | "lg";
}

const VeggieButton = forwardRef<HTMLButtonElement, VeggieButtonProps>(
  ({ className, variant = "primary", size = "default", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{
          outline: 'none'
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all disabled:pointer-events-none disabled:opacity-40",
          "focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
          variant === "primary" && "bg-primary text-primary-foreground hover-elevate active-elevate-2",
          variant === "secondary" && "bg-transparent border-[1.5px] border-lettuce text-foreground hover:border-lettuce/80 active:border-lettuce/60",
          variant === "tertiary" && "bg-beetroot text-beetroot-foreground hover-elevate active-elevate-2",
          size === "default" && "min-h-9 px-4 py-2.5 text-base",
          size === "sm" && "min-h-8 px-3 py-2 text-sm",
          size === "lg" && "min-h-10 px-5 py-3 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);

VeggieButton.displayName = "VeggieButton";

export { VeggieButton };
