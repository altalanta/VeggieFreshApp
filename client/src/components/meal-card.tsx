import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NutrientBadge } from "@/components/ui/nutrient-badge";
import { Trash2, Utensils, Apple, Coffee, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Meal } from "@shared/schema";

interface MealCardProps {
  meal: Meal;
  onDelete?: (id: string) => void;
}

const mealTypeIcons = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  snack: Apple,
};

const mealTypeLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function MealCard({ meal, onDelete }: MealCardProps) {
  const Icon = mealTypeIcons[meal.mealType as keyof typeof mealTypeIcons] || Utensils;
  const time = new Date(meal.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card className="border-card-border hover-elevate overflow-visible">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg font-semibold text-card-foreground leading-tight">
              {meal.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mealTypeLabels[meal.mealType as keyof typeof mealTypeLabels]} • {time}
            </p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(meal.id)}
            data-testid={`button-delete-meal-${meal.id}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover-elevate active-elevate-2"
            aria-label="Delete meal"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <NutrientBadge variant="info">
            {meal.calories} cal
          </NutrientBadge>
          <NutrientBadge variant="vitamin">
            Protein {meal.protein}g
          </NutrientBadge>
          {meal.iron > 0 && (
            <NutrientBadge variant="iron">
              Iron {meal.iron}mg
            </NutrientBadge>
          )}
          {meal.vitaminC > 0 && (
            <NutrientBadge variant="vitamin">
              Vitamin C {meal.vitaminC}mg
            </NutrientBadge>
          )}
          {meal.calcium > 0 && (
            <NutrientBadge variant="vitamin">
              Calcium {meal.calcium}mg
            </NutrientBadge>
          )}
          {meal.folate > 0 && (
            <NutrientBadge variant="vitamin">
              Folate {meal.folate}mcg
            </NutrientBadge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
