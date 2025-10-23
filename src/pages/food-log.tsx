import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealCard } from "@/components/meal-card";
import { AddMealDialog } from "@/components/add-meal-dialog";
import { VeggieButton } from "@/components/ui/veggie-button";
import { NutrientBadge } from "@/components/ui/nutrient-badge";
import { Loader2, ArrowLeft, TrendingUp } from "lucide-react";
import type { Meal, InsertMeal, DailyNutrients, WeeklyNutrients } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function FoodLog() {
  const { toast } = useToast();

  const { data: meals = [], isLoading: mealsLoading } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  const { data: dailyNutrients, isLoading: nutrientsLoading } = useQuery<DailyNutrients>({
    queryKey: ["/api/nutrients/daily"],
  });

  const { data: weeklyNutrients, isLoading: weeklyNutrientsLoading } = useQuery<WeeklyNutrients>({
    queryKey: ["/api/nutrients/weekly"],
  });

  const addMealMutation = useMutation({
    mutationFn: async (meal: InsertMeal) => {
      return await apiRequest("POST", "/api/meals", meal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrients/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrients/weekly"] });
      toast({
        title: "Meal logged successfully",
        description: "Your meal has been added to the log.",
      });
    },
    onError: () => {
      toast({
        title: "Error logging meal",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/meals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrients/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrients/weekly"] });
      toast({
        title: "Meal deleted",
        description: "The meal has been removed from your log.",
      });
    },
  });

  const groupedMeals = meals.reduce((acc, meal) => {
    const date = new Date(meal.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  const sortedDates = Object.keys(groupedMeals).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const isLoading = mealsLoading || nutrientsLoading || weeklyNutrientsLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <VeggieButton variant="secondary" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </VeggieButton>
          </Link>
          <AddMealDialog onAddMeal={addMealMutation.mutate} isPending={addMealMutation.isPending} />
        </div>

        <header className="space-y-2">
          <h1 className="font-serif text-4xl font-semibold tracking-tight bg-gradient-to-r from-beetroot to-primary bg-clip-text text-transparent">
            Food Log
          </h1>
          <p className="text-muted-foreground">
            Complete history of your meals and nutrition tracking
          </p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {dailyNutrients && (
              <Card className="border-card-border bg-gradient-to-br from-beetroot/5 to-primary/5" data-testid="card-daily-totals">
                <CardHeader className="border-b border-card-border">
                  <CardTitle className="font-serif text-2xl flex items-center gap-2 text-beetroot">
                    <TrendingUp className="h-5 w-5 text-beetroot" />
                    Today's Totals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Macronutrients</h4>
                    <div className="flex flex-wrap gap-2">
                      <NutrientBadge variant="info">
                        {dailyNutrients.calories.toFixed(0)} calories
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Protein {dailyNutrients.protein.toFixed(1)}g
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Fat {dailyNutrients.fat.toFixed(1)}g
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Carbs {dailyNutrients.carbohydrates.toFixed(1)}g
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Fiber {dailyNutrients.fiber.toFixed(1)}g
                      </NutrientBadge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Vitamins & Minerals</h4>
                    <div className="flex flex-wrap gap-2">
                      <NutrientBadge variant="iron">
                        Iron {dailyNutrients.iron.toFixed(1)}mg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Folate {dailyNutrients.folate.toFixed(1)}mcg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Vitamin C {dailyNutrients.vitaminC.toFixed(1)}mg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Vitamin A {dailyNutrients.vitaminA.toFixed(1)}mcg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Calcium {dailyNutrients.calcium.toFixed(1)}mg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Zinc {dailyNutrients.zinc.toFixed(1)}mg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Selenium {dailyNutrients.selenium.toFixed(1)}mcg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Iodine {dailyNutrients.iodine.toFixed(1)}mcg
                      </NutrientBadge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">B-Complex Vitamins</h4>
                    <div className="flex flex-wrap gap-2">
                      <NutrientBadge variant="vitamin">
                        B1 {dailyNutrients.vitaminB1.toFixed(1)}mg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        B2 {dailyNutrients.vitaminB2.toFixed(1)}mg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        B3 {dailyNutrients.vitaminB3.toFixed(1)}mg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        B6 {dailyNutrients.vitaminB6.toFixed(1)}mg
                      </NutrientBadge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Electrolytes & Fluids</h4>
                    <div className="flex flex-wrap gap-2">
                      <NutrientBadge variant="vitamin">
                        Sodium {dailyNutrients.sodium.toFixed(0)}mg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Potassium {dailyNutrients.potassium.toFixed(0)}mg
                      </NutrientBadge>
                      <NutrientBadge variant="vitamin">
                        Water {dailyNutrients.water.toFixed(0)}ml
                      </NutrientBadge>
                    </div>
                  </div>

                  {weeklyNutrients && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Weekly Targets (This Week)</h4>
                      <div className="flex flex-wrap gap-2">
                        <NutrientBadge variant="info">
                          Choline {weeklyNutrients.choline.toFixed(1)}mg
                        </NutrientBadge>
                        <NutrientBadge variant="info">
                          DHA {weeklyNutrients.dha.toFixed(1)}mg
                        </NutrientBadge>
                        <NutrientBadge variant="info">
                          EPA {weeklyNutrients.epa.toFixed(1)}mg
                        </NutrientBadge>
                        <NutrientBadge variant="info">
                          Vitamin D {weeklyNutrients.vitaminD.toFixed(1)}mcg
                        </NutrientBadge>
                        <NutrientBadge variant="info">
                          B12 {weeklyNutrients.vitaminB12.toFixed(1)}mcg
                        </NutrientBadge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {meals.length === 0 ? (
              <Card className="border-card-border">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <TrendingUp className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-serif text-2xl font-medium text-foreground mb-2">
                    No meals in your log yet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Start your nutrition journey by logging your first meal and tracking your daily intake
                  </p>
                  <AddMealDialog onAddMeal={addMealMutation.mutate} isPending={addMealMutation.isPending} />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {sortedDates.map((date) => (
                  <div key={date} className="space-y-3">
                    <h2 className="font-serif text-xl font-semibold text-beetroot sticky top-0 bg-background py-2 z-10 border-b border-beetroot/20">
                      {date}
                    </h2>
                    <div className="space-y-3">
                      {groupedMeals[date].map((meal) => (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          onDelete={deleteMealMutation.mutate}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
