import { cn } from "@/lib/utils";

interface NutrientProgressProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  className?: string;
  showBadge?: boolean;
}

export function NutrientProgress({ 
  value, 
  max, 
  label, 
  unit = "mg",
  className,
  showBadge = false 
}: NutrientProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const isIron = label.toLowerCase().includes("iron");
  
  return (
    <div className={cn("space-y-2", className)} data-testid={`progress-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground" data-testid={`text-label-${label.toLowerCase().replace(/\s+/g, "-")}`}>
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground tabular-nums" data-testid={`text-value-${label.toLowerCase().replace(/\s+/g, "-")}`}>
          {value.toFixed(1)}{unit} / {max}{unit}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-progress-track">
        <div
          className={cn(
            "h-full transition-all duration-300",
            isIron ? "bg-beetroot" : "bg-lettuce"
          )}
          style={{ width: `${percentage}%` }}
          data-testid={`bar-${label.toLowerCase().replace(/\s+/g, "-")}`}
          data-color={isIron ? "beetroot" : "lettuce"}
          aria-label={`${label} progress: ${percentage.toFixed(0)}% complete`}
        />
      </div>
      {showBadge && percentage >= 100 && (
        <div className="flex justify-end">
          <span className="text-xs font-medium text-lettuce" data-testid={`badge-goal-met-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            Goal met!
          </span>
        </div>
      )}
    </div>
  );
}
