type Trimester = 1 | 2 | 3;

export interface CalorieGuidanceCopy {
  headline: string;
  description: string;
  example: string;
}

const calorieExamples: Record<Trimester, string> = {
  1: "Focus on gentle, easy snacks that you can tolerate—crackers with nut butter, smoothies, or yogurt count.",
  2: "Think “Greek yogurt + banana + 1 Tbsp almond butter” (~340 kcal) or “hummus wrap with veggies and avocado.”",
  3: "Try “oatmeal cooked with milk + walnuts + dried fruit” (~450 kcal) or “lentil soup with whole-grain toast.”",
};

const trimesterHeadlines: Record<Trimester, string> = {
  1: "First Trimester: Maintain baseline calories",
  2: "Second Trimester: Bump up daily calories",
  3: "Third Trimester: Fuel baby's rapid growth",
};

export function getCalorieGuidanceCopy(
  trimester: Trimester,
  additionalCalories: number
): CalorieGuidanceCopy {
  if (trimester === 1 || additionalCalories === 0) {
    return {
      headline: trimesterHeadlines[1],
      description:
        "Hormonal shifts and nausea mean appetite can dip. Your calorie target stays close to baseline right now—prioritize hydration and nutrient-dense bites when you can.",
      example: calorieExamples[1],
    };
  }

  const description =
    trimester === 2
      ? `Blood volume, placenta, and baby are growing fast. Aim for roughly +${additionalCalories} calories a day on top of your baseline.`
      : `Baby is packing on energy reserves and you’re building milk stores. Aim for roughly +${additionalCalories} calories a day on top of your baseline.`;

  return {
    headline: trimesterHeadlines[trimester],
    description,
    example: calorieExamples[trimester],
  };
}

export function getProteinGuidanceCopy(multiplier: number, trimester: Trimester): string {
  if (trimester === 3) {
    return `Late pregnancy calls for ${multiplier.toFixed(1)} g of protein per kg—your target supports baby's brain and muscle development.`;
  }
  return `Early pregnancy targets ${multiplier.toFixed(1)} g of protein per kg to keep mom’s tissues strong as baby develops.`;
}
