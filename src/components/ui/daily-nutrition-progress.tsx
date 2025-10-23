import { NutrientProgress } from "./nutrient-progress";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import type { DailyNutrients, DailyGoals } from "@shared/schema";
import { DEFAULT_NUTRIENT_GOALS } from "@shared/nutrient-goals";

interface DailyNutritionProgressProps {
  nutrients: DailyNutrients;
  goals: DailyGoals;
  isPlantBased?: boolean;
  gentleMode?: boolean;
}

const dailyNutrientMapping: { label: string; unit: string; key: keyof DailyNutrients }[] = [
  // Macronutrients
  { label: "Calories", unit: "kcal", key: "calories" },
  { label: "Protein", unit: "g", key: "protein" },
  { label: "Fat", unit: "g", key: "fat" },
  { label: "Carbohydrates", unit: "g", key: "carbohydrates" },
  { label: "Fiber", unit: "g", key: "fiber" },
  // Key Vitamins & Minerals
  { label: "Iron", unit: "mg", key: "iron" },
  { label: "Folate", unit: "mcg", key: "folate_natural" },
  { label: "Folic Acid", unit: "mcg", key: "folate_synthetic" },
  { label: "Vitamin C", unit: "mg", key: "vitaminC" },
  { label: "Vitamin A (Preformed)", unit: "IU", key: "vitaminA_preformed" },
  { label: "Vitamin A (Beta-Carotene)", unit: "mcg", key: "vitaminA_betaCarotene" },
  { label: "Calcium", unit: "mg", key: "calcium" },
  { label: "Zinc", unit: "mg", key: "zinc" },
  { label: "Selenium", unit: "mcg", key: "selenium" },
  { label: "Iodine", unit: "mcg", key: "iodine" },
  { label: "Magnesium", unit: "mg", key: "magnesium" },
  { label: "Vitamin E", unit: "mg", key: "vitaminE" },
  { label: "Vitamin K", unit: "mcg", key: "vitaminK" },
  { label: "Copper", unit: "mcg", key: "copper" },
  // B-Complex Vitamins
  { label: "Vitamin B1 (Thiamine)", unit: "mg", key: "vitaminB1" },
  { label: "Vitamin B2 (Riboflavin)", unit: "mg", key: "vitaminB2" },
  { label: "Vitamin B3 (Niacin)", unit: "mg", key: "vitaminB3" },
  { label: "Vitamin B6", unit: "mg", key: "vitaminB6" },
  { label: "Vitamin B12", unit: "mcg", key: "vitaminB12" },
  { label: "Biotin", unit: "mcg", key: "biotin" },
  { label: "Pantothenic Acid", unit: "mg", key: "pantothenicAcid" },
  // Electrolytes & Fluids
  { label: "Sodium", unit: "mg", key: "sodium" },
  { label: "Potassium", unit: "mg", key: "potassium" },
  { label: "Water", unit: "ml", key: "water" },
  // Specialized Nutrients (formerly weekly)
  { label: "Choline", unit: "mg", key: "choline" },
  { label: "DHA (Omega-3)", unit: "mg", key: "dha" },
  { label: "EPA (Omega-3)", unit: "mg", key: "epa" },
  { label: "Vitamin D", unit: "mcg", key: "vitaminD" },
  // Trace Minerals
  { label: "Manganese", unit: "mg", key: "manganese" },
  { label: "Chromium", unit: "mcg", key: "chromium" },
  { label: "Molybdenum", unit: "mcg", key: "molybdenum" },
];

const plantBasedKeys: (keyof DailyNutrients)[] = ["vitaminB12", "iron", "zinc", "choline", "dha", "calcium", "iodine"];

export function DailyNutritionProgress({ nutrients, goals, isPlantBased, gentleMode }: DailyNutritionProgressProps) {
  const renderNutrientSection = (title: string, keys: (keyof DailyNutrients)[], highlight = false) => {
    const filteredKeys = isPlantBased && !highlight ? keys.filter(k => !plantBasedKeys.includes(k)) : keys;
    
    if (filteredKeys.length === 0) return null;

    return (
      <Card className={`border-card-border ${highlight ? "border-2 border-primary shadow-lg" : ""}`}>
        <CardHeader className={`border-b border-card-border ${highlight ? "bg-gradient-to-r from-primary/10 to-lettuce/10" : "bg-gradient-to-r from-beetroot/5 to-primary/5"}`}>
          <CardTitle className="font-serif text-xl text-beetroot">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {filteredKeys.map((key) => {
            const mapping = dailyNutrientMapping.find(m => m.key === key);
            if (!mapping) return null; // Should not happen if mapping is complete
            const nutrientId = key as string;
            const goalEntry = goals[nutrientId];
            const defaultGoal = DEFAULT_NUTRIENT_GOALS[nutrientId];
            const dailyGoal = goalEntry?.dailyGoal ?? defaultGoal?.dailyGoal ?? 0;
            const upperLimit = goalEntry?.upperLimit ?? defaultGoal?.upperLimit;

            return (
              <NutrientProgress
                key={key}
                label={mapping.label}
                value={nutrients[key] || 0}
                max={dailyGoal}
                upperLimit={upperLimit}
                unit={mapping.unit}
                showBadge
                gentleMode={gentleMode}
              />
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {isPlantBased && renderNutrientSection("Key Plant-Based Nutrients", plantBasedKeys, true)}
      {renderNutrientSection("Macronutrients", ["calories", "protein", "fat", "carbohydrates", "fiber"])}
      {renderNutrientSection("Key Vitamins & Minerals", ["iron", "folate_natural", "folate_synthetic", "vitaminC", "vitaminA_preformed", "vitaminA_betaCarotene", "calcium", "zinc", "selenium", "iodine", "magnesium", "vitaminE", "vitaminK", "copper"])}
      {renderNutrientSection("B-Complex Vitamins", ["vitaminB1", "vitaminB2", "vitaminB3", "vitaminB6", "vitaminB12", "biotin", "pantothenicAcid"])}
      {renderNutrientSection("Electrolytes & Fluids", ["sodium", "potassium", "water"])}
      {renderNutrientSection("Specialized Nutrients", ["choline", "dha", "epa", "vitaminD"])}
      {renderNutrientSection("Trace Minerals", ["manganese", "chromium", "molybdenum"])}
    </div>
  );
}
