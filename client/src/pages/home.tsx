import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NutrientProgress } from "@/components/ui/nutrient-progress";
import { MealCard } from "@/components/meal-card";
import { AddMealDialog } from "@/components/add-meal-dialog";
import { VeggieButton } from "@/components/ui/veggie-button";
import { Loader2, Activity, Calendar } from "lucide-react";
import type { Meal, InsertMeal, DailyNutrients, DailyGoals } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();

  const { data: meals = [], isLoading: mealsLoading } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  const { data: dailyNutrients, isLoading: nutrientsLoading } = useQuery<DailyNutrients>({
    queryKey: ["/api/nutrients/daily"],
  });

  const { data: dailyGoals } = useQuery<DailyGoals>({
    queryKey: ["/api/goals/daily"],
  });

  const addMealMutation = useMutation({
    mutationFn: async (meal: InsertMeal) => {
      return await apiRequest("POST", "/api/meals", meal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrients/daily"] });
      toast({
        title: "Meal logged successfully",
        description: "Your meal has been added to today's log.",
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
      toast({
        title: "Meal deleted",
        description: "The meal has been removed from your log.",
      });
    },
  });

  const todaysMeals = meals.filter((meal) => {
    const mealDate = new Date(meal.timestamp);
    const today = new Date();
    return (
      mealDate.getDate() === today.getDate() &&
      mealDate.getMonth() === today.getMonth() &&
      mealDate.getFullYear() === today.getFullYear()
    );
  });

  const isLoading = mealsLoading || nutrientsLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <header className="space-y-2">
          <h1 className="font-serif text-4xl font-semibold text-foreground tracking-tight">
            Today's Nutrition
          </h1>
          <p className="text-muted-foreground">
            Track your daily nutrients and stay healthy during your pregnancy journey
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span data-testid="text-current-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          <div className="flex gap-2">
            <Link href="/log">
              <VeggieButton variant="secondary" data-testid="button-view-log">
                <Activity className="h-4 w-4" />
                View Full Log
              </VeggieButton>
            </Link>
            <AddMealDialog onAddMeal={addMealMutation.mutate} isPending={addMealMutation.isPending} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Daily Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {dailyNutrients && dailyGoals && (
                  <>
                    <NutrientProgress
                      label="Calories"
                      value={dailyNutrients.calories}
                      max={dailyGoals.calories}
                      unit="kcal"
                      showBadge
                    />
                    <NutrientProgress
                      label="Protein"
                      value={dailyNutrients.protein}
                      max={dailyGoals.protein}
                      unit="g"
                      showBadge
                    />
                    <NutrientProgress
                      label="Iron"
                      value={dailyNutrients.iron}
                      max={dailyGoals.iron}
                      unit="mg"
                      showBadge
                    />
                    <NutrientProgress
                      label="Vitamin C"
                      value={dailyNutrients.vitaminC}
                      max={dailyGoals.vitaminC}
                      unit="mg"
                      showBadge
                    />
                    <NutrientProgress
                      label="Calcium"
                      value={dailyNutrients.calcium}
                      max={dailyGoals.calcium}
                      unit="mg"
                      showBadge
                    />
                    <NutrientProgress
                      label="Folate"
                      value={dailyNutrients.folate}
                      max={dailyGoals.folate}
                      unit="mcg"
                      showBadge
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Today's Meals
              </h2>
              {todaysMeals.length === 0 ? (
                <Card className="border-card-border">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                      No meals logged yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Start tracking your nutrition by logging your first meal of the day
                    </p>
                    <AddMealDialog onAddMeal={addMealMutation.mutate} isPending={addMealMutation.isPending} />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3" data-testid="list-meals">
                  {todaysMeals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onDelete={deleteMealMutation.mutate}
                    />
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
