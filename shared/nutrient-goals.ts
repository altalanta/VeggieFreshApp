export interface NutrientGoalDefinition {
  dailyGoal: number;
  upperLimit?: number;
}

/**
 * Default daily goals and upper limits for nutrients that should always be
 * available to the client even if user-specific targets have not been created
 * yet. These values come from the VeggieFresh evidence-based requirements.
 */
export const DEFAULT_NUTRIENT_GOALS: Record<string, NutrientGoalDefinition> = {
  calories: { dailyGoal: 2200 },
  protein: { dailyGoal: 71 },
  fat: { dailyGoal: 77 },
  carbohydrates: { dailyGoal: 300 },
  fiber: { dailyGoal: 28 },
  iron: { dailyGoal: 27, upperLimit: 45 },
  folate_natural: { dailyGoal: 600 },
  folate_synthetic: { dailyGoal: 600, upperLimit: 1000 },
  vitaminC: { dailyGoal: 85, upperLimit: 2000 },
  vitaminA_preformed: { dailyGoal: 770, upperLimit: 10000 }, // IU
  vitaminA_betaCarotene: { dailyGoal: 2588 }, // mcg RAE equivalent
  calcium: { dailyGoal: 1000, upperLimit: 2500 },
  zinc: { dailyGoal: 11, upperLimit: 40 },
  selenium: { dailyGoal: 60, upperLimit: 400 },
  iodine: { dailyGoal: 220, upperLimit: 1100 },
  vitaminD: { dailyGoal: 20, upperLimit: 100 }, // mcg (800 IU / 4000 IU)
  vitaminB12: { dailyGoal: 2.6 },
  choline: { dailyGoal: 450, upperLimit: 3500 },
  dha: { dailyGoal: 200 },
  epa: { dailyGoal: 200 },
  magnesium: { dailyGoal: 360, upperLimit: 350 },
  vitaminE: { dailyGoal: 15, upperLimit: 1000 },
  vitaminK: { dailyGoal: 90 },
  copper: { dailyGoal: 1000, upperLimit: 10000 },
  biotin: { dailyGoal: 30 },
  pantothenicAcid: { dailyGoal: 6 },
  manganese: { dailyGoal: 2, upperLimit: 11 },
  chromium: { dailyGoal: 30 },
  molybdenum: { dailyGoal: 50, upperLimit: 2000 },
  sodium: { dailyGoal: 1500, upperLimit: 2300 },
  potassium: { dailyGoal: 2900 },
  water: { dailyGoal: 2700 },
};

export const DEFAULT_DAILY_GOAL_KEYS = Object.keys(DEFAULT_NUTRIENT_GOALS);
