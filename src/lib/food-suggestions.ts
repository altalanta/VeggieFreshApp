import { DailyNutrients, DailyGoals, UserProfile } from "@shared/schema";
import { DEFAULT_NUTRIENT_GOALS } from "@shared/nutrient-goals";

interface Food {
  name: string;
  nutrients: Partial<Record<keyof DailyNutrients, number>>;
  tags: ('vegan' | 'vegetarian' | 'gluten-free' | 'dairy-free')[];
}

const foodDatabase: Food[] = [
  // Lentils - Folate Superstar
  { name: "1 cup of cooked lentils", nutrients: { folate_natural: 358 }, tags: ['vegan', 'vegetarian', 'gluten-free'] },
  
  // Calcium Sources
  { name: "1 cup of plain yogurt", nutrients: { calcium: 450, protein: 12 }, tags: ['vegetarian'] },
  { name: "1 cup of fortified soy milk", nutrients: { calcium: 300, vitaminD: 3 }, tags: ['vegan', 'vegetarian', 'dairy-free'] },
  { name: "3 oz of canned sardines (with bones)", nutrients: { calcium: 325, dha: 300, epa: 200, vitaminD: 4 }, tags: [] },

  // Iron Sources
  { name: "3 oz of lean beef", nutrients: { iron: 2.5, zinc: 5 }, tags: [] },
  { name: "1 cup of spinach", nutrients: { iron: 6.4, magnesium: 157 }, tags: ['vegan', 'vegetarian', 'gluten-free'] },

  // Magnesium Sources
  { name: "1 oz of pumpkin seeds", nutrients: { magnesium: 156, iron: 2.5 }, tags: ['vegan', 'vegetarian', 'gluten-free'] },
  { name: "1 oz of almonds", nutrients: { magnesium: 80, vitaminE: 7.3 }, tags: ['vegan', 'vegetarian', 'gluten-free'] },

  // Choline Sources
  { name: "1 large egg", nutrients: { choline: 147, protein: 6 }, tags: ['vegetarian'] },
  { name: "3 oz of firm tofu", nutrients: { choline: 71, protein: 17 }, tags: ['vegan', 'vegetarian', 'gluten-free'] },
];

export interface FoodSuggestion {
  food: Food;
  suggestionText: string;
}

export function getFoodSuggestions(
  nutrients: DailyNutrients,
  goals: DailyGoals,
  userProfile: UserProfile
): FoodSuggestion[] {
  const suggestions: FoodSuggestion[] = [];
  const deficits: Partial<Record<keyof DailyNutrients, number>> = {};

  // 1. Identify nutrient deficits
  for (const key in goals) {
    const nutrientKey = key as keyof DailyNutrients;
    const goalEntry = goals[nutrientKey];
    const defaultGoal = DEFAULT_NUTRIENT_GOALS[nutrientKey as string];
    const goal = goalEntry?.dailyGoal ?? defaultGoal?.dailyGoal ?? 0;
    const current = nutrients[nutrientKey] || 0;
    if (goal && current < goal) {
      deficits[nutrientKey] = goal - current;
    }
  }
  
  // 2. Filter food database based on user preferences
  const dietaryPrefs = userProfile.dietaryPreferences || [];
  const preferenceSet = new Set(dietaryPrefs.map((pref) => pref.toLowerCase()));
  const allergies = userProfile.foodAllergies || [];

  let filteredFoods = foodDatabase.filter(food => {
    if (preferenceSet.has('vegan') && !food.tags.includes('vegan')) return false;
    if (preferenceSet.has('vegetarian') && !food.tags.includes('vegetarian')) return false;
    // Add more allergy filtering here, e.g., if allergies include 'dairy', filter out foods without 'dairy-free' tag
    return true;
  });

  // 3. Generate suggestions for top 3 deficits
  const sortedDeficits = Object.entries(deficits).sort((a, b) => b[1] - a[1]);

  for (const [nutrient, deficit] of sortedDeficits.slice(0, 3)) {
    const bestFood = filteredFoods
      .filter(food => food.nutrients[nutrient as keyof DailyNutrients])
      .sort((a, b) => (b.nutrients[nutrient as keyof DailyNutrients] || 0) - (a.nutrients[nutrient as keyof DailyNutrients] || 0))[0];

    if (bestFood) {
      const nutrientAmount = bestFood.nutrients[nutrient as keyof DailyNutrients] || 0;
      suggestions.push({
        food: bestFood,
        suggestionText: `You're low on ${nutrient.replace('_', ' ')}. Try ${bestFood.name} to get +${nutrientAmount} units.`,
      });
      // Remove used food to avoid duplicate suggestions
      filteredFoods = filteredFoods.filter(f => f.name !== bestFood.name);
    }
  }
  
  return suggestions;
}
