import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { NutrientProgress } from "./nutrient-progress";
import type { WeeklyNutrients, WeeklyGoals } from "@shared/schema";

interface WeeklySummaryProps {
  nutrients: WeeklyNutrients;
  goals: WeeklyGoals;
}

const weeklyNutrientMapping: { label: string; unit: string; key: keyof WeeklyNutrients }[] = [
  { label: "Calories", unit: "kcal", key: "calories" },
  { label: "Protein", unit: "g", key: "protein" },
  { label: "Iron", unit: "mg", key: "iron" },
  { label: "Folate", unit: "mcg", key: "folate" },
  { label: "Vitamin D", unit: "mcg", key: "vitaminD" },
  { label: "Calcium", unit: "mg", key: "calcium" },
  { label: "Choline", unit: "mg", key: "choline" },
];

export function WeeklySummary({ nutrients, goals }: WeeklySummaryProps) {
  return (
    <Card className="border-card-border">
      <CardHeader className="border-b border-card-border bg-gradient-to-r from-primary/5 to-lettuce/5">
        <CardTitle className="font-serif text-xl text-primary">This Week's Average</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your average daily intake for the current week.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {weeklyNutrientMapping.map((nutrient) => (
          <NutrientProgress
            key={nutrient.key}
            label={nutrient.label}
            value={nutrients[nutrient.key] ? nutrients[nutrient.key] / 7 : 0} // Averaging the weekly total
            max={goals[nutrient.key] || 0}
            unit={nutrient.unit}
            showBadge
          />
        ))}
      </CardContent>
    </Card>
  );
}
