import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VeggieButton } from "@/components/ui/veggie-button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertWeeklySymptoms, DailyNutrients, DailyGoals } from "@shared/schema";
import { DEFAULT_NUTRIENT_GOALS } from "@shared/nutrient-goals";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PLACEHOLDER_USER_ID = "test-user-id"; // Placeholder until actual auth is implemented

const formSchema = z.object({
  nauseaSeverity: z.enum(['none', 'mild', 'moderate', 'severe']),
  fatigueLevel: z.enum(['normal', 'slight', 'significant', 'extreme']),
  foodAversions: z.enum(['none', 'some', 'many', 'severe']),
  constipation: z.boolean().default(false),
  heartburn: z.boolean().default(false),
  legCramps: z.boolean().default(false),
  headaches: z.boolean().default(false),
  cravings: z.boolean().default(false),
});

type SymptomFormValues = z.infer<typeof formSchema>;

export function SymptomCheckinDialog() {
  const [open, setOpen] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [guidanceContent, setGuidanceContent] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const { toast } = useToast();

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nauseaSeverity: 'none',
      fatigueLevel: 'normal',
      foodAversions: 'none',
      constipation: false,
      heartburn: false,
      legCramps: false,
      headaches: false,
      cravings: false,
    },
  });

  const getGuidanceForSymptoms = (data: SymptomFormValues, dailyNutrients: DailyNutrients | null, dailyGoals: DailyGoals | null) => {
    // Nausea + Low Nutrition Reassurance
    const isNauseaSignificant = data.nauseaSeverity === 'moderate' || data.nauseaSeverity === 'severe';
    let areGoalsLow = false;
    const calorieGoal = dailyGoals?.calories?.dailyGoal ?? DEFAULT_NUTRIENT_GOALS.calories.dailyGoal;
    if (dailyNutrients && calorieGoal > 0) {
      if ((dailyNutrients.calories / calorieGoal) < 0.5) {
        areGoalsLow = true;
      }
    }

    if (isNauseaSignificant && areGoalsLow) {
      return {
        title: "❤️ A Reassuring Note on Nausea & Nutrition",
        content: (
          <div className="space-y-3 text-sm">
            <p className="font-bold">THIS IS NORMAL. You are not failing.</p>
            <p>It's incredibly challenging to eat well when you feel sick. In the first trimester, your baby weighs less than an ounce and gets most of its nutrients directly from your body's stores.</p>
            <p>Focus on the absolute essentials right now:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Taking your <strong>prenatal vitamin</strong>.</li>
              <li>Staying <strong>hydrated</strong> (sips of water, electrolyte drinks).</li>
              <li>Eating <strong>anything that stays down</strong>, even if it's just crackers.</li>
            </ul>
            <p className="font-semibold pt-2">You are doing everything right by listening to your body. This phase will pass.</p>
          </div>
        )
      };
    }

    if (isNauseaSignificant) {
      return {
        title: "Managing Nausea in Pregnancy",
        content: (
          <div className="space-y-2 text-sm">
            <p>Nausea is very common, but there are ways to manage it:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><strong>Small, Frequent Meals:</strong> An empty stomach can worsen nausea.</li>
              <li><strong>Protein with Snacks:</strong> Helps stabilize blood sugar.</li>
              <li><strong>Ginger:</strong> Try ginger tea, chews, or capsules.</li>
              <li><strong>Vitamin B6:</strong> Ask your provider about taking 25mg, 3 times a day.</li>
            </ul>
            <p className="font-semibold pt-2">Red Flags (Contact your provider if you experience these):</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>You can't keep any food or water down for 24 hours.</li>
              <li>You are losing weight.</li>
              <li>Your urine is dark-colored.</li>
            </ul>
          </div>
        )
      };
    }
    if (data.constipation) {
      return {
        title: "Tips for Managing Constipation",
        content: (
          <div className="space-y-2 text-sm">
            <p>Constipation during pregnancy is often caused by hormones and iron supplements.</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><strong>Increase Fiber:</strong> Aim for 25-30 grams per day from sources like prunes, beans, and whole grains.</li>
              <li><strong>Hydrate:</strong> Drink at least 8-10 glasses of water daily.</li>
              <li><strong>Magnesium-Rich Foods:</strong> Foods like almonds and spinach can help. Consider a magnesium supplement (ask your provider).</li>
              <li><strong>Physical Activity:</strong> Gentle exercise like walking can help.</li>
              <li><strong>Iron Dosing:</strong> If you're on iron supplements, ask your provider about an every-other-day dosing schedule.</li>
            </ul>
          </div>
        )
      };
    }
    if (data.legCramps) {
      return {
        title: "Alleviating Leg Cramps",
        content: (
          <div className="space-y-2 text-sm">
            <p>Leg cramps, especially at night, can be a sign of magnesium or calcium imbalance.</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><strong>Magnesium:</strong> This is a common deficiency. Focus on magnesium-rich foods or ask your provider about a magnesium glycinate supplement before bed.</li>
              <li><strong>Stretching:</strong> Gently stretch your calf muscles before bed and when a cramp strikes.</li>
              <li><strong>Hydration:</strong> Ensure you're drinking enough water throughout the day.</li>
            </ul>
          </div>
        )
      };
    }
    return null;
  };

  const handleSubmit = async (data: SymptomFormValues) => {
    try {
      // Fetch user profile and nutrition data to provide contextual guidance
      const userProfile = await apiRequest("GET", `/api/users/profile/${PLACEHOLDER_USER_ID}`);
      const today = new Date().toISOString().split('T')[0];
      const dailyNutrients: DailyNutrients = await apiRequest("GET", `/api/nutrients/daily/${PLACEHOLDER_USER_ID}?date=${today}`);
      const dailyGoals: DailyGoals = await apiRequest("GET", `/api/goals/daily/${PLACEHOLDER_USER_ID}?date=${today}`);

      const weeklySymptoms: InsertWeeklySymptoms = {
        userId: PLACEHOLDER_USER_ID,
        week: userProfile.currentWeek || 10, // Use actual week or fallback
        ...data,
      };

      await apiRequest("POST", "/api/weekly-symptoms", weeklySymptoms);

      toast({
        title: "Symptoms Logged!",
        description: "Your weekly symptoms have been saved.",
      });

      const guidance = getGuidanceForSymptoms(data, dailyNutrients, dailyGoals);
      if (guidance) {
        setGuidanceContent(guidance);
        setShowGuidance(true);
      } else {
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Error logging symptoms:", error);
      toast({
        title: "Failed to Log Symptoms",
        description: "There was an error logging your symptoms. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGuidanceClose = () => {
    setShowGuidance(false);
    setGuidanceContent(null);
    setOpen(false);
    form.reset();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <VeggieButton variant="outline">Log Weekly Symptoms</VeggieButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weekly Symptom Check-in</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nauseaSeverity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nausea Severity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatigueLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fatigue Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="slight">Slight</SelectItem>
                        <SelectItem value="significant">Significant</SelectItem>
                        <SelectItem value="extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="foodAversions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Aversions</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="some">Some</SelectItem>
                        <SelectItem value="many">Many</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="constipation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Constipation</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="heartburn"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Heartburn</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="legCramps"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Leg Cramps</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headaches"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Headaches</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cravings"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Cravings</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <VeggieButton type="submit">Save Symptoms</VeggieButton>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showGuidance} onOpenChange={setShowGuidance}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{guidanceContent?.title}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              {guidanceContent?.content}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleGuidanceClose}>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
