import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyNutritionProgress } from "@/components/ui/daily-nutrition-progress";
import { VeggieButton } from "@/components/ui/veggie-button";
import { Loader2, Calendar } from "lucide-react";
import type { DailyNutrients, DailyGoals, WeeklyNutrients, WeeklyGoals, Nudge, IntakeEntry, UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { NudgeCard } from "@/components/ui/nudge-card";
import { AddIntakeDialog } from "@/components/add-intake-dialog";
import { WeeklySummary } from "@/components/ui/weekly-summary";
import { GentleNudgeCard } from "@/components/ui/gentle-nudge-card";
import { SymptomCheckinDialog } from "@/components/symptom-checkin-dialog";
import { Badge } from "@/components/ui/badge";
import { getFoodSuggestions, FoodSuggestion } from "@/lib/food-suggestions";
import { useState, useEffect, useMemo } from "react";
import { getBaselineCalories, getCalorieGoalDetails, getProteinGoalDetails, getWeightInKg, calculateBMI } from "@/lib/pregnancy-calculations";
import { getCalorieGuidanceCopy, getProteinGuidanceCopy } from "@/lib/trimester-guidance";
import { DEFAULT_NUTRIENT_GOALS } from "@shared/nutrient-goals";

const PLACEHOLDER_USER_ID = "test-user-id"; // Placeholder until actual auth is implemented

export default function Home() {
  const { toast } = useToast();
  const [foodSuggestions, setFoodSuggestions] = useState<FoodSuggestion[]>([]);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format for query
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of current week (Sunday)
  const startOfWeekString = startOfWeek.toISOString().split('T')[0];

  const { data: userProfile, isLoading: userProfileLoading } = useQuery<UserProfile>({
    queryKey: ["userProfile", PLACEHOLDER_USER_ID],
    queryFn: () => apiRequest("GET", `/api/users/profile/${PLACEHOLDER_USER_ID}`),
  });

  const { data: dailyNutrients, isLoading: dailyNutrientsLoading } = useQuery<DailyNutrients>({
    queryKey: ["dailyNutrients", PLACEHOLDER_USER_ID, today],
    queryFn: () => apiRequest("GET", `/api/nutrients/daily/${PLACEHOLDER_USER_ID}?date=${today}`),
  });

  const { data: dailyGoals, isLoading: dailyGoalsLoading } = useQuery<DailyGoals>({
    queryKey: ["dailyGoals", PLACEHOLDER_USER_ID, today],
    queryFn: () => apiRequest("GET", `/api/goals/daily/${PLACEHOLDER_USER_ID}?date=${today}`),
  });

  const { data: weeklyNutrients, isLoading: weeklyNutrientsLoading } = useQuery<WeeklyNutrients>({
    queryKey: ["weeklyNutrients", PLACEHOLDER_USER_ID, startOfWeekString],
    queryFn: () => apiRequest("GET", `/api/nutrients/weekly/${PLACEHOLDER_USER_ID}?startDate=${startOfWeekString}`),
  });

  const { data: weeklyGoals, isLoading: weeklyGoalsLoading } = useQuery<WeeklyGoals>({
    queryKey: ["weeklyGoals", PLACEHOLDER_USER_ID, startOfWeekString],
    queryFn: () => apiRequest("GET", `/api/goals/weekly/${PLACEHOLDER_USER_ID}?startDate=${startOfWeekString}`),
  });

  useEffect(() => {
    if (dailyNutrients && dailyGoals && userProfile) {
      const suggestions = getFoodSuggestions(dailyNutrients, dailyGoals, userProfile);
      setFoodSuggestions(suggestions);
    }
  }, [dailyNutrients, dailyGoals, userProfile]);

  const { data: nudges = [], isLoading: nudgesLoading } = useQuery<Nudge[]>({
    queryKey: ["nudges", PLACEHOLDER_USER_ID, today],
    queryFn: () => apiRequest("GET", `/api/nudges/${PLACEHOLDER_USER_ID}?date=${today}`),
  });

  const { data: recentIntakeEntries = [], isLoading: intakeEntriesLoading, refetch: refetchIntakeEntries } = useQuery<IntakeEntry[]>({
    queryKey: ["intakeEntries", PLACEHOLDER_USER_ID, today],
    queryFn: () => apiRequest("GET", `/api/intake-entries/${PLACEHOLDER_USER_ID}?date=${today}`),
  });

  const handleIntakeSuccess = () => {
    refetchIntakeEntries();
    queryClient.invalidateQueries({ queryKey: ["dailyNutrients", PLACEHOLDER_USER_ID, today] });
    queryClient.invalidateQueries({ queryKey: ["dailyGoals", PLACEHOLDER_USER_ID, today] });
    queryClient.invalidateQueries({ queryKey: ["weeklyNutrients", PLACEHOLDER_USER_ID, startOfWeekString] });
    queryClient.invalidateQueries({ queryKey: ["weeklyGoals", PLACEHOLDER_USER_ID, startOfWeekString] });
    queryClient.invalidateQueries({ queryKey: ["nudges", PLACEHOLDER_USER_ID, today] });
  };

  const isLoading = userProfileLoading || dailyNutrientsLoading || dailyGoalsLoading || weeklyNutrientsLoading || weeklyGoalsLoading || nudgesLoading || intakeEntriesLoading;

  const firstTrimesterGentleNudges = [
    "The first trimester can be tough. Remember to rest and be kind to yourself.",
    "Even small, nutrient-dense snacks can make a big difference. You're doing great!",
    "Listen to your body. Some days are about survival, and that's perfectly okay.",
    "Hydration is key, especially when you're not feeling your best. Sip water throughout the day.",
  ];

  const preferenceSet = new Set(
    (userProfile?.dietaryPreferences ?? []).map((pref) => pref.toLowerCase())
  );
  const isPlantBased = preferenceSet.has("vegetarian") || preferenceSet.has("vegan");
  const isVegan = preferenceSet.has("vegan");
  const gentleMode = userProfile?.currentTrimester === 1;
  const trimester = userProfile?.currentTrimester as 1 | 2 | 3 | undefined;
  const heightCm = userProfile?.height;
  const weightKg = getWeightInKg(userProfile?.prePregnancyWeight, userProfile?.prePregnancyWeightUnit);
  const hasAnthropometrics = Boolean(weightKg && heightCm);
  const baselineCalories = userProfile && hasAnthropometrics ? getBaselineCalories(userProfile) : undefined;
  const bmiValue =
    userProfile?.prePregnancyBMI ??
    (hasAnthropometrics && weightKg && heightCm
      ? calculateBMI(weightKg, heightCm)
      : undefined);
  const calorieDetails =
    baselineCalories !== undefined && bmiValue && trimester
      ? getCalorieGoalDetails(baselineCalories, bmiValue, trimester)
      : undefined;
  const proteinDetails =
    weightKg && trimester
      ? getProteinGoalDetails(weightKg, trimester)
      : undefined;
  const calorieCopy =
    trimester && calorieDetails
      ? getCalorieGuidanceCopy(trimester, Math.round(calorieDetails.additionalCalories))
      : undefined;
  const proteinCopy =
    trimester && proteinDetails
      ? getProteinGuidanceCopy(proteinDetails.multiplier, trimester)
      : undefined;

  const plantBasedNutrientList = ["vitaminB12", "iron", "zinc", "choline", "dha", "calcium", "iodine"] as const;
  const nutrientLabels: Record<(typeof plantBasedNutrientList)[number], string> = {
    vitaminB12: "Vitamin B12",
    iron: "Iron",
    zinc: "Zinc",
    choline: "Choline",
    dha: "DHA",
    calcium: "Calcium",
    iodine: "Iodine",
  };
  const nutrientUnits: Record<(typeof plantBasedNutrientList)[number], string> = {
    vitaminB12: "mcg",
    iron: "mg",
    zinc: "mg",
    choline: "mg",
    dha: "mg",
    calcium: "mg",
    iodine: "mcg",
  };

  const plantBasedSummary = useMemo(() => {
    if (!isPlantBased || !dailyNutrients || !dailyGoals) {
      return [];
    }

    return plantBasedNutrientList.map((nutrientId) => {
      const intake = dailyNutrients[nutrientId] ?? 0;
      const goalEntry = dailyGoals[nutrientId] ?? DEFAULT_NUTRIENT_GOALS[nutrientId];
      const goal = goalEntry?.dailyGoal ?? 0;
      if (!goal) {
        return null;
      }
      const ratio = goal === 0 ? 0 : intake / goal;
      let status: "optimal" | "caution" | "low";
      if (ratio >= 0.8) {
        status = "optimal";
      } else if (ratio >= 0.5) {
        status = "caution";
      } else {
        status = "low";
      }
      return {
        nutrientId,
        label: nutrientLabels[nutrientId],
        intake,
        goal,
        ratio,
        status,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [isPlantBased, dailyNutrients, dailyGoals]);

  const plantStatusMeta = {
    optimal: { label: "On track", className: "text-green-600" },
    caution: { label: "Watch this nutrient", className: "text-amber-600" },
    low: { label: "Priority today", className: "text-red-600" },
  };

  const calciumIntakeNeedsAttention = (currentNutrients: DailyNutrients, goalGetter: (nutrientId: string) => number) => {
    const calciumGoal = goalGetter("calcium");
    if (!calciumGoal) return false;
    const calciumIntake = currentNutrients.calcium ?? 0;
    return calciumIntake < calciumGoal * 0.75;
  };

  const plantBasedNudges = useMemo(() => {
    if (!isPlantBased || !dailyNutrients || gentleMode) {
      return [];
    }

    const nudges: string[] = [];
    const getGoal = (nutrientId: string) =>
      dailyGoals?.[nutrientId]?.dailyGoal ?? DEFAULT_NUTRIENT_GOALS[nutrientId]?.dailyGoal ?? 0;

    const b12Intake = dailyNutrients.vitaminB12 ?? 0;
    const b12Goal = getGoal("vitaminB12");
    if (b12Goal && b12Intake < b12Goal) {
      nudges.push(
        `Vitamin B12 is critical on a plant-based diet to protect baby’s nervous system. Consider a methylcobalamin supplement or fortified foods (nutritional yeast, fortified plant milks) to reach the ${b12Goal.toFixed(1)}mcg goal.`
      );
    }

    const ironGoal = getGoal("iron");
    const ironIntake = dailyNutrients.iron ?? 0;
    if (ironGoal && ironIntake < ironGoal * 0.8) {
      nudges.push(
        "Boost iron absorption by pairing lentils, beans, or spinach with vitamin C foods (citrus, bell peppers) and spacing tea/coffee away from meals."
      );
    }

    const dhaGoal = getGoal("dha");
    const dhaIntake = dailyNutrients.dha ?? 0;
    if (dhaGoal && dhaIntake < dhaGoal) {
      nudges.push(
        "Aim for 200-300mg DHA daily. Algae-based omega-3 supplements offer the same benefit as fish oil with zero animal products."
      );
    }

    const cholineGoal = getGoal("choline");
    const cholineIntake = dailyNutrients.choline ?? 0;
    if (cholineGoal && cholineIntake < cholineGoal * 0.75) {
      nudges.push(
        "Choline supports baby’s brain development. Try soybeans/edamame, tofu, quinoa, or consider an Alpha-GPC supplement if intake stays low."
      );
    }

    const zincGoal = getGoal("zinc");
    const zincIntake = dailyNutrients.zinc ?? 0;
    if (zincGoal && zincIntake < zincGoal * 0.75) {
      nudges.push(
        "Enhance zinc absorption by soaking or sprouting beans and grains, and think about a gentle 11mg zinc supplement if levels stay low."
      );
    }

    if (isVegan && calciumIntakeNeedsAttention(dailyNutrients, getGoal)) {
      nudges.push(
        "Fortified plant milks, calcium-set tofu, and leafy greens help you reach calcium needs without dairy. Aim to spread servings throughout the day."
      );
    }

    return nudges;
  }, [isPlantBased, isVegan, dailyNutrients, dailyGoals, gentleMode]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-4">
        <h1 className="font-serif text-4xl font-semibold tracking-tight bg-gradient-to-r from-beetroot to-primary bg-clip-text text-transparent">
          Today's Nutrition
        </h1>
        {isPlantBased && (
          <Badge variant="secondary" className="text-sm">
            🌱 Plant-Based Mode
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-x-4 text-muted-foreground">
        <p>
          Track your daily nutrients and stay healthy during your pregnancy journey
        </p>
        {userProfile?.currentWeek && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">Week {userProfile.currentWeek} of 40</Badge>
            <Badge variant="outline">Trimester {userProfile.currentTrimester}</Badge>
          </div>
        )}
      </div>
      {calorieDetails && proteinDetails && calorieCopy && proteinCopy && baselineCalories !== undefined && (
        <div className="mt-4 space-y-3 rounded-lg border border-card-border bg-muted/10 p-4">
          <div className="space-y-1">
            <p className="font-serif text-lg text-beetroot">{calorieCopy.headline}</p>
            <p className="text-sm text-muted-foreground">{calorieCopy.description}</p>
            <p className="text-xs italic text-muted-foreground">{calorieCopy.example}</p>
          </div>
          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Calorie goal</p>
              <p className="text-sm text-foreground">
                Baseline: <span className="font-semibold">{Math.round(baselineCalories)} kcal</span> • Goal:{" "}
                <span className="font-semibold">{Math.round(calorieDetails.calorieGoal)} kcal/day</span>
              </p>
              {calorieDetails.additionalCalories > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Add roughly +{Math.round(calorieDetails.additionalCalories)} kcal/day this trimester to meet growth needs.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No extra calories needed right now—gentle, nutrient-dense snacks are perfect.
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Protein goal</p>
              <p className="text-sm text-foreground">
                Target about <span className="font-semibold">{proteinDetails.proteinGoal} g</span> daily ({proteinDetails.multiplier.toFixed(1)} g/kg).
              </p>
              <p className="text-xs text-muted-foreground">{proteinCopy}</p>
            </div>
          </div>
        </div>
      )}
    </header>

        {isPlantBased && plantBasedSummary.length > 0 && (
          <Card className="border-card-border">
            <CardHeader className="border-b border-card-border bg-gradient-to-r from-primary/5 to-lettuce/5">
              <CardTitle className="font-serif text-xl text-beetroot">Plant-Based Pregnancy Check</CardTitle>
              <p className="text-sm text-muted-foreground">
                Focus on these nutrients today—getting close to goal protects energy, iron status, and baby’s brain development.
              </p>
            </CardHeader>
            <CardContent className="divide-y divide-card-border p-0">
              {plantBasedSummary.map((item) => (
                <div key={item.nutrientId} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.intake.toFixed(1)} / {item.goal.toFixed(1)} {nutrientUnits[item.nutrientId]}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${plantStatusMeta[item.status].className}`}>
                    {plantStatusMeta[item.status].label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-beetroot">
            <Calendar className="h-4 w-4" />
            <span data-testid="text-current-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          <div className="flex gap-2">
            <SymptomCheckinDialog />
            <Link href="/log">
              <VeggieButton variant="secondary" data-testid="button-view-log">
                View Full Log
              </VeggieButton>
            </Link>
            <AddIntakeDialog onAddIntakeSuccess={handleIntakeSuccess} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {(nudges.length > 0 || foodSuggestions.length > 0 || plantBasedNudges.length > 0) && (
              <div className="space-y-3">
                <h2 className="font-serif text-2xl font-semibold text-beetroot">
                  Daily Nudges & Suggestions
                </h2>
                {userProfile?.currentTrimester === 1 ? (
                  <GentleNudgeCard message={firstTrimesterGentleNudges[new Date().getDate() % firstTrimesterGentleNudges.length]} />
                ) : (
                  <>
                    {nudges.map((nudge) => (
                      <NudgeCard key={nudge.id} suggestionText={nudge.suggestionText || "No suggestion text."} />
                    ))}
                    {foodSuggestions.map((suggestion, index) => (
                      <NudgeCard key={index} suggestionText={suggestion.suggestionText} />
                    ))}
                    {plantBasedNudges.map((message, index) => (
                      <NudgeCard key={`plant-based-${index}`} suggestionText={message} />
                    ))}
                  </>
                )}
              </div>
            )}

    {dailyNutrients && dailyGoals && (
      <DailyNutritionProgress 
        nutrients={dailyNutrients} 
        goals={dailyGoals} 
        isPlantBased={isPlantBased}
        gentleMode={gentleMode}
      />
    )}

            {weeklyNutrients && weeklyGoals && (
              <div className="space-y-3">
                <h3 className="font-serif text-xl font-semibold text-beetroot">This Week's Average</h3>
                <WeeklySummary 
                  nutrients={weeklyNutrients} 
                  goals={weeklyGoals} 
                />
              </div>
            )}

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-beetroot">
                Recent Intake
              </h2>
              {recentIntakeEntries.length === 0 ? (
                <Card className="border-card-border">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                      No intake logged yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Start tracking your nutrition by logging your first intake entry.
                    </p>
                    <AddIntakeDialog onAddIntakeSuccess={handleIntakeSuccess} />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3" data-testid="list-intake-entries">
                  {recentIntakeEntries.map((entry) => (
                    <Card key={entry.id} className="border-card-border">
                      <CardContent className="flex flex-col p-4">
                        <p className="font-serif text-lg font-medium text-foreground">
                          {entry.freeText} - {entry.qty} {entry.unit}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Logged: {new Date(entry.dateTime).toLocaleTimeString()}
                        </p>
                        {/* Potentially display associated nutrients here later */}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
