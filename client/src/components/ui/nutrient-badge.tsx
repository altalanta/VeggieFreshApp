import { cn } from "@/lib/utils";

interface NutrientBadgeProps {
  variant?: "iron" | "vitamin" | "info";
  children: React.ReactNode;
  className?: string;
}

export function NutrientBadge({ variant = "vitamin", children, className }: NutrientBadgeProps) {
  const badgeText = typeof children === 'string' ? children : '';
  const testId = badgeText ? `badge-${badgeText.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}` : undefined;
  
  return (
    <span
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        variant === "iron" && "bg-beetroot text-beetroot-foreground",
        variant === "vitamin" && "bg-transparent border border-beetroot text-foreground",
        variant === "info" && "bg-beetroot/15 text-beetroot border border-beetroot/30",
        className
      )}
    >
      {children}
    </span>
  );
}
