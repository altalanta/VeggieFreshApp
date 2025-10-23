import { UserProfile } from "@shared/schema";

/**
 * Calculates gestational age, trimester, and estimated due date based on Last Menstrual Period (LMP).
 * @param lmp The date of the last menstrual period.
 * @returns An object containing weeks, days, trimester, and estimatedDueDate.
 */
export function calculateGestationalAge(lmp: Date): {
  weeks: number;
  days: number;
  trimester: 1 | 2 | 3;
  estimatedDueDate: Date;
} {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lmp.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  
  let trimester: 1 | 2 | 3;
  if (weeks <= 13) trimester = 1;
  else if (weeks <= 27) trimester = 2;
  else trimester = 3;
  
  const dueDate = new Date(lmp);
  dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
  
  return { weeks, days, trimester, estimatedDueDate: dueDate };
}

/**
 * Calculates Body Mass Index (BMI).
 * @param weightKg Weight in kilograms.
 * @param heightCm Height in centimeters.
 * @returns The calculated BMI.
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm === 0) return 0; // Avoid division by zero
  const heightM = heightCm / 100; // Convert cm to meters
  return weightKg / (heightM * heightM);
}

/**
 * Calculates BMI category.
 * @param bmi The BMI value.
 * @returns The BMI category string.
 */
export function getBMICategory(bmi: number): "Underweight" | "Normal weight" | "Overweight" | "Obese" | "Unknown" {
  if (bmi < 18.5) return "Underweight";
  if (bmi >= 18.5 && bmi < 25) return "Normal weight";
  if (bmi >= 25 && bmi < 30) return "Overweight";
  if (bmi >= 30) return "Obese";
  return "Unknown";
}

/**
 * Calculates the estimated trimester based on current week of pregnancy.
 * @param currentWeek The current week of pregnancy.
 * @returns The estimated trimester (1, 2, or 3).
 */
export function getTrimesterFromWeek(currentWeek: number): 1 | 2 | 3 {
  if (currentWeek <= 13) return 1;
  if (currentWeek <= 27) return 2;
  return 3;
}

/**
 * Calculates BMI-adjusted calorie goals based on baseline calories, BMI, and trimester.
 * @param baselineCalories Pre-pregnancy calorie needs.
 * @param bmi Current or pre-pregnancy BMI.
 * @param trimester Current trimester.
 * @returns The adjusted daily calorie goal.
 */
export function calculateCalorieGoal(
  baselineCalories: number,
  bmi: number,
  trimester: 1 | 2 | 3
): number {
  if (trimester === 1) return baselineCalories;
  
  let additionalCalories: number;
  
  if (bmi < 18.5) {
    // Underweight
    additionalCalories = trimester === 2 ? 400 : 500;
  } else if (bmi < 25) {
    // Normal weight
    additionalCalories = trimester === 2 ? 340 : 450;
  } else if (bmi < 30) {
    // Overweight
    additionalCalories = trimester === 2 ? 300 : 400;
  } else {
    // Obese
    additionalCalories = trimester === 2 ? 250 : 300;
  }
  
  return baselineCalories + additionalCalories;
}

/**
 * Calculates protein goals based on weight and trimester.
 * @param weightKg Weight in kilograms.
 * @param trimester Current trimester.
 * @returns The daily protein goal in grams.
 */
export function calculateProteinGoal(
  weightKg: number,
  trimester: 1 | 2 | 3
): number {
  const multiplier = trimester === 3 ? 1.5 : 1.2;
  return Math.round(weightKg * multiplier);
}

/**
 * A placeholder for a more complex baseline calorie calculation (e.g., Mifflin-St Jeor).
 * For now, returns a static value or a value based on a simple heuristic.
 * @param userProfile The user's profile information.
 * @returns Baseline calorie needs.
 */
export function getBaselineCalories(userProfile: UserProfile): number {
  const weightKg = getWeightInKg(userProfile.prePregnancyWeight, userProfile.prePregnancyWeightUnit);
  if (weightKg && userProfile.height) {
    // Using Mifflin-St Jeor for a more accurate BMR, assuming age 30 and sedentary for now
    const age = 30; // Placeholder, should be collected at onboarding
    const activityLevel = "sedentary"; // Placeholder
    return calculateMifflinStJeor(weightKg, userProfile.height, age, activityLevel);
  }
  return 2000; // Default if no weight/height is provided
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation and adjusts for activity level.
 * @param weightKg Weight in kilograms.
 * @param heightCm Height in centimeters.
 * @param age Age in years.
 * @param activityLevel User's activity level.
 * @returns The estimated daily calorie needs.
 */
export function calculateMifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
): number {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161; // Formula for women

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * activityMultipliers[activityLevel]);
}

export function getWeightInKg(
  weight?: number,
  unit: UserProfile["prePregnancyWeightUnit"] = "kg"
): number | undefined {
  if (!weight) return undefined;
  if (unit === "lbs") {
    return weight * 0.453592;
  }
  return weight;
}

export function getCalorieGoalDetails(
  baselineCalories: number,
  bmi: number,
  trimester: 1 | 2 | 3
): { calorieGoal: number; additionalCalories: number } {
  const calorieGoal = calculateCalorieGoal(baselineCalories, bmi, trimester);
  const additionalCalories = Math.max(0, calorieGoal - baselineCalories);
  return { calorieGoal, additionalCalories };
}

export function getProteinGoalDetails(
  weightKg: number,
  trimester: 1 | 2 | 3
): { proteinGoal: number; multiplier: number } {
  const multiplier = trimester === 3 ? 1.5 : 1.2;
  return { proteinGoal: calculateProteinGoal(weightKg, trimester), multiplier };
}
