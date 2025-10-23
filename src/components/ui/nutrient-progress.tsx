import { cn } from "@/lib/utils";

interface NutrientProgressProps {
  value: number;
  max: number;
  upperLimit?: number;
  label: string;
  unit?: string;
  className?: string;
  showBadge?: boolean;
  gentleMode?: boolean;
}

export function NutrientProgress({ 
  value, 
  max, 
  upperLimit,
  label, 
  unit = "mg",
  className,
  showBadge = false,
  gentleMode = false
}: NutrientProgressProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const rawPercentage = max > 0 ? (value / max) * 100 : 0;

  const getColorClass = () => {
    if (upperLimit && value > upperLimit) {
      return "bg-red-500"; // Red: Exceeded upper limit - DANGEROUS
    }
    if (gentleMode) {
      if (rawPercentage >= 120) {
        return "bg-orange-400"; // Still flag significant overage
      }
      if (rawPercentage >= 80) {
        return "bg-green-500"; // Celebrate meeting goal
      }
      return "bg-slate-300"; // Neutral tone for deficits in gentle mode
    }
    if (upperLimit && value > max * 1.2) {
      return "bg-orange-500"; // Orange: Exceeded goal significantly, approaching UL
    }
    if (rawPercentage > 120) {
      return "bg-orange-400"; // Orange: Mildly over goal
    }
    if (rawPercentage >= 80 && rawPercentage <= 120) {
      return "bg-green-500"; // Green: Optimal Range
    }
    if (rawPercentage >= 50 && rawPercentage < 80) {
      return "bg-yellow-500"; // Yellow: Approaching goal
    }
    return "bg-lettuce"; // Default color for under 50%
  };
  
  return (
    <div className={cn("space-y-2", className)} data-testid={`progress-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground" data-testid={`text-label-${label.toLowerCase().replace(/\s+/g, "-")}`}>
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground tabular-nums" data-testid={`text-value-${label.toLowerCase().replace(/\s+/g, "-")}`}>
          {gentleMode && rawPercentage < 80 ? (
            <>
              Managed {value.toFixed(1)}{unit} • Goal {max}{unit}
            </>
          ) : (
            <>
              {value.toFixed(1)}{unit} / {max}{unit}
            </>
          )}
          {upperLimit && <span className="text-xs text-muted-foreground"> (UL: {upperLimit}{unit})</span>}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-progress-track">
        <div
          className={cn(
            "h-full transition-all duration-300",
            getColorClass()
          )}
          style={{ width: `${Math.min(rawPercentage, 100)}%` }}
          data-testid={`bar-${label.toLowerCase().replace(/\s+/g, "-")}`}
          aria-label={`${label} progress: ${rawPercentage.toFixed(0)}% complete`}
        />
      </div>
      {showBadge && rawPercentage >= 80 && rawPercentage <= 120 && (
        <div className="flex justify-end">
          <span className="text-xs font-medium text-green-600" data-testid={`badge-goal-met-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            Optimal!
          </span>
        </div>
      )}
    </div>
  );
}
