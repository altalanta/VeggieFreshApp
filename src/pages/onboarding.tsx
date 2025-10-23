import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VeggieButton } from "@/components/ui/veggie-button";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { calculateGestationalAge, calculateBMI, getBMICategory, getBaselineCalories, getCalorieGoalDetails, getProteinGoalDetails, getWeightInKg } from "@/lib/pregnancy-calculations";
import type { UserProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "wouter";
import { getCalorieGuidanceCopy, getProteinGuidanceCopy } from "@/lib/trimester-guidance";

const PLACEHOLDER_USER_ID = "test-user-id"; // Placeholder until actual auth is implemented

const formSchema = z.object({
  // Step 1: Pregnancy Information
  lastMenstrualPeriod: z.date().optional(),

  // Step 2: Physical Measurements
  prePregnancyWeight: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  weightUnit: z.enum(["kg", "lbs"]).default("kg"),

  // Step 3: Dietary Preferences
  dietaryPreferences: z.array(z.string()).default([]),

  // Step 4: Food Allergies/Intolerances
  foodAllergies: z.array(z.string()).default([]),
  otherAllergies: z.string().optional(),

  // Step 5: Medical History
  previousNTD: z.boolean().default(false),
  multiplesPregnancy: z.boolean().default(false),
  bariatricHistory: z.boolean().default(false),
  gestationalDiabetesHistory: z.boolean().default(false),
  preExistingConditions: z.string().optional(),

  // Step 6: Current Supplements
  prenatalVitaminBrand: z.string().optional(),
  manualSupplementNutrients: z.string().optional(),
  noSupplement: z.boolean().default(false),
});

type OnboardingFormValues = z.infer<typeof formSchema>;

interface OnboardingProps {
  onOnboardingComplete: () => void;
}

export default function Onboarding({ onOnboardingComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryPreferences: [],
      foodAllergies: [],
      weightUnit: "kg",
      previousNTD: false,
      multiplesPregnancy: false,
      bariatricHistory: false,
      gestationalDiabetesHistory: false,
      noSupplement: false,
    },
  });

  const { watch, setValue } = form;
  const lmp = watch("lastMenstrualPeriod");
  const weight = watch("prePregnancyWeight");
  const height = watch("height");
  const weightUnit = watch("weightUnit");
  const dietaryPreferences = watch("dietaryPreferences");

  const [showPlantBasedModal, setShowPlantBasedModal] = useState(false);

  const { weeks, estimatedDueDate, trimester } = lmp ? calculateGestationalAge(lmp) : { weeks: 0, estimatedDueDate: null, trimester: 1 };
  const weightKg = getWeightInKg(weight, weightUnit);
  const heightCm = height || 0;
  const bmi = weightKg && heightCm ? calculateBMI(weightKg, heightCm) : 0;
  const bmiCategory = bmi ? getBMICategory(bmi) : "Unknown";

  const baselineCalories = lmp && weightKg && heightCm
    ? getBaselineCalories({
        prePregnancyWeight: weightKg,
        prePregnancyWeightUnit: "kg",
        height: heightCm,
      } as UserProfile)
    : undefined;
  const calorieDetails =
    lmp && baselineCalories !== undefined && bmi
      ? getCalorieGoalDetails(baselineCalories, bmi, trimester)
      : undefined;
  const proteinDetails = lmp && weightKg ? getProteinGoalDetails(weightKg, trimester) : undefined;
  const calorieCopy =
    calorieDetails && baselineCalories !== undefined
      ? getCalorieGuidanceCopy(trimester, Math.round(calorieDetails.additionalCalories))
      : undefined;
  const proteinCopy = proteinDetails ? getProteinGuidanceCopy(proteinDetails.multiplier, trimester) : undefined;

  useEffect(() => {
    const hasPlantBased = dietaryPreferences.some((pref) => {
      const normalized = pref.toLowerCase();
      return normalized === "vegetarian" || normalized === "vegan";
    });

    if (hasPlantBased) {
      setShowPlantBasedModal(true);
    } else {
      setShowPlantBasedModal(false);
    }
  }, [dietaryPreferences]);

  const handleNext = async () => {
    // Validate current step's fields before proceeding
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger("lastMenstrualPeriod");
    } else if (step === 2) {
      isValid = await form.trigger(["prePregnancyWeight", "height"]);
    }
    // Add validation for other steps as they become required
    else {
      isValid = true; // For now, allow progression if no specific validation yet
    }

    if (isValid) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        onSubmit(form.getValues());
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (values: OnboardingFormValues) => {
    try {
      const userProfile: UserProfile = {
        lastMenstrualPeriod: values.lastMenstrualPeriod,
        estimatedDueDate: lmp ? estimatedDueDate : undefined,
        currentWeek: lmp ? weeks : undefined,
        currentTrimester: lmp ? trimester : undefined,
        prePregnancyWeight: weight || undefined,
        prePregnancyWeightUnit: weight ? weightUnit : undefined,
        prePregnancyBMI: weightKg && heightCm ? bmi : undefined,
        height: values.height,
        dietaryPreferences: values.dietaryPreferences.map((pref) => pref.toLowerCase()),
        foodAllergies: values.foodAllergies,
        previousNTD: values.previousNTD,
        multiplesPregnancy: values.multiplesPregnancy,
        bariatricHistory: values.bariatricHistory,
        gestationalDiabetesHistory: values.gestationalDiabetesHistory,
        preExistingConditions: values.preExistingConditions,
        prenatalVitaminBrand: values.prenatalVitaminBrand,
        // Simplified for now: assuming manualSupplementNutrients is a JSON string or parsed object if structured
        prenatalVitaminNutrients: values.manualSupplementNutrients ? JSON.parse(values.manualSupplementNutrients) : undefined,
      };

      await apiRequest("PUT", `/api/users/${PLACEHOLDER_USER_ID}/profile`, { profile: userProfile });
      
      // Additional logic for setting up initial targets based on onboarding data would go here
      // For example, calling storage.createTarget for each nutrient based on trimester and BMI

      toast({
        title: "Onboarding Complete!",
        description: "Your profile has been set up successfully.",
      });
      onOnboardingComplete(); // Call the prop to signal completion to App.tsx
    } catch (error) {
      console.error("Onboarding submission error:", error);
      toast({
        title: "Onboarding Failed",
        description: "There was an error saving your information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="font-serif text-xl text-beetroot">1. Pregnancy Information</h3>
              <p className="text-muted-foreground">Please provide your last menstrual period date to calculate your estimated due date and current week of pregnancy.</p>
              
              <FormField
                control={form.control}
                name="lastMenstrualPeriod"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>First day of Last Menstrual Period (LMP)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <VeggieButton
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal border-input-border bg-input-background",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-input-foreground" />
                          </VeggieButton>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background text-foreground border-card-border" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      This will be used to calculate your current week of pregnancy and estimated due date.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {lmp && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-foreground">Current Week of Pregnancy: <span className="font-semibold">Week {weeks} of 40</span></p>
                  <p className="text-sm text-foreground">Estimated Due Date: <span className="font-semibold">{estimatedDueDate?.toLocaleDateString()}</span></p>
                </div>
              )}
            </form>
          </Form>
        );
      case 2:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="font-serif text-xl text-beetroot">2. Physical Measurements</h3>
              <p className="text-muted-foreground">Enter your pre-pregnancy or current starting weight and height.</p>

              <FormField
                control={form.control}
                name="prePregnancyWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting Weight</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} className="border-input-border bg-input-background text-input-foreground" />
                    </FormControl>
                    <FormDescription>Your weight before or at the start of your pregnancy.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weightUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-input-border bg-input-background text-input-foreground">
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background text-foreground border-card-border">
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} className="border-input-border bg-input-background text-input-foreground" />
                    </FormControl>
                    <FormDescription>Your height in centimeters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {weight && height && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Your BMI category is: <span className="font-semibold text-foreground">{bmiCategory}</span></p>
                  <p className="text-xs text-muted-foreground">Note: We calculate BMI to personalize your calorie recommendations but will not display the number to you.</p>
                </div>
              )}

              {weightKg && height && lmp && baselineCalories !== undefined && calorieDetails && proteinDetails && calorieCopy && proteinCopy && (
                <div className="mt-6 rounded-lg border border-card-border bg-muted/20 p-4 space-y-3">
                  <h4 className="font-serif text-lg text-beetroot">Personalized energy & protein guidance</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">{calorieCopy.headline}</p>
                    <p className="text-sm text-muted-foreground">{calorieCopy.description}</p>
                    <p className="text-xs italic text-muted-foreground">{calorieCopy.example}</p>
                    <p className="text-sm text-foreground pt-1">
                      Baseline: <span className="font-semibold">{Math.round(baselineCalories)} kcal</span> • Current goal:{" "}
                      <span className="font-semibold">{Math.round(calorieDetails.calorieGoal)} kcal/day</span>
                      {calorieDetails.additionalCalories > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {" "}({`+${Math.round(calorieDetails.additionalCalories)} kcal`} this trimester)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-2 border-t border-card-border pt-3">
                    <p className="text-sm font-semibold text-foreground">Protein target</p>
                    <p className="text-sm text-muted-foreground">{proteinCopy}</p>
                    <p className="text-sm text-foreground">
                      Aim for about <span className="font-semibold">{proteinDetails.proteinGoal} grams</span> of protein per day
                      ({proteinDetails.multiplier.toFixed(1)} g/kg). Spread it across meals with options like eggs, lentils, tofu, Greek yogurt, or edamame.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </Form>
        );
      case 3:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="font-serif text-xl text-beetroot">3. Dietary Preferences</h3>
              <p className="text-muted-foreground">Select any dietary preferences you have.</p>

              <FormField
                control={form.control}
                name="dietaryPreferences"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Dietary Preferences</FormLabel>
                      <FormDescription>Select all that apply.</FormDescription>
                    </div>
                    {[ "Vegetarian", "Vegan", "Pescatarian", "No dietary restrictions" ].map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="dietaryPreferences"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(dietaryPreferences.includes("Vegan") || dietaryPreferences.includes("Vegetarian")) && showPlantBasedModal && (
                <AlertDialog open={showPlantBasedModal} onOpenChange={setShowPlantBasedModal}>
                  <AlertDialogTrigger asChild>
                    {/* Hidden trigger, modal opens automatically */}
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background text-foreground border-card-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif text-2xl text-beetroot">Supporting Your Plant-Based Pregnancy</AlertDialogTitle>
                      <AlertDialogDescription>
                        Clinical guidelines indicate that meeting all prenatal nutrition needs is typically easier with a diet that includes some animal products, particularly for:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Vitamin B12 (found primarily in animal foods)</li>
                          <li>Iron (more bioavailable from meat)</li>
                          <li>DHA omega-3 (from fish)</li>
                          <li>Zinc and choline (higher in animal sources)</li>
                          <li>Complete protein (easier to obtain)</li>
                        </ul>
                        However, a well-planned plant-based diet can be healthy with careful attention to these nutrients.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel asChild>
                        <VeggieButton variant="secondary" onClick={() => setShowPlantBasedModal(false)}>Proceed with Plant-Based Pregnancy Diet</VeggieButton>
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <VeggieButton onClick={() => window.open("https://example.com/vegan-pregnancy-nutrition", "_blank")}>Learn More About Vegan Pregnancy Nutrition</VeggieButton>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </form>
          </Form>
        );
      case 4:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="font-serif text-xl text-beetroot">4. Food Allergies/Intolerances</h3>
              <p className="text-muted-foreground">Indicate any food allergies or intolerances.</p>

              <FormField
                control={form.control}
                name="foodAllergies"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Common Allergens</FormLabel>
                      <FormDescription>Select all that apply.</FormDescription>
                    </div>
                    {[ "Dairy", "Eggs", "Fish", "Shellfish", "Nuts", "Soy" ].map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="foodAllergies"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="otherAllergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Allergies/Intolerances</FormLabel>
                    <FormControl>
                      <Textarea placeholder="E.g., Gluten, Strawberries" className="resize-none border-input-border bg-input-background text-input-foreground" {...field} />
                    </FormControl>
                    <FormDescription>List any other foods you need to avoid.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      case 5:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="font-serif text-xl text-beetroot">5. Medical History (Optional)</h3>
              <p className="text-muted-foreground">Please provide any relevant medical history.</p>

              <FormField
                control={form.control}
                name="previousNTD"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-input-border bg-input-background">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Previous pregnancy with neural tube defect?</FormLabel>
                      <FormDescription>This may flag you for a higher folate protocol.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="multiplesPregnancy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-input-border bg-input-background">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Multiple pregnancy (twins/triplets)?</FormLabel>
                      <FormDescription>This will increase all your nutrient requirements.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bariatricHistory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-input-border bg-input-background">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Bariatric surgery history?</FormLabel>
                      <FormDescription>Requires enhanced B12, iron, and calcium monitoring.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gestationalDiabetesHistory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-input-border bg-input-background">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Gestational diabetes in previous pregnancy?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preExistingConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pre-existing medical conditions affecting nutrition</FormLabel>
                    <FormControl>
                      <Textarea placeholder="E.g., Crohn's disease, PCOS" className="resize-none border-input-border bg-input-background text-input-foreground" {...field} />
                    </FormControl>
                    <FormDescription>List any conditions that may impact your nutritional needs.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      case 6:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="font-serif text-xl text-beetroot">6. Current Supplements</h3>
              <p className="text-muted-foreground">Tell us about any prenatal supplements you are currently taking.</p>

              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-4 rounded-md shadow-sm" role="alert">
                <p className="font-bold text-lg">⚠️ Important: Folic Acid vs. Folate</p>
                <p className="text-sm mt-2">
                  Many prenatal vitamins contain synthetic "folic acid." Research suggests that 
                  natural <strong>folate (methylfolate/5-MTHF)</strong> may be better absorbed and utilized, 
                  especially for women with certain genetic variations (MTHFR).
                </p>
                <p className="text-sm mt-2">
                  Look for prenatal vitamins containing <strong>"folate," "5-MTHF," "L-methylfolate," 
                  or "Quatrefolic"</strong> rather than "folic acid."
                </p>
                <p className="font-bold mt-3">High-folate foods to emphasize:</p>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  <li><strong>Lentils:</strong> 180mcg per 1/2 cup cooked</li>
                  <li><strong>Black beans:</strong> 128mcg per 1/2 cup</li>
                  <li><strong>Spinach:</strong> 131mcg per 1/2 cup cooked</li>
                  <li><strong>Asparagus:</strong> 134mcg per 4 spears</li>
                  <li><strong>Avocado:</strong> 61mcg per 1/2 avocado</li>
                </ul>
              </div>

              <FormField
                control={form.control}
                name="prenatalVitaminBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What prenatal supplement are you taking?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-input-border bg-input-background text-input-foreground">
                          <SelectValue placeholder="Select a prenatal vitamin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background text-foreground border-card-border">
                        <SelectItem value="brand_a">Brand A Prenatal</SelectItem>
                        <SelectItem value="brand_b">Brand B Prenatal</SelectItem>
                        <SelectItem value="other">Other / Manually Enter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select from our database or manually enter details.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watch("prenatalVitaminBrand") === "other" && (
                <FormField
                  control={form.control}
                  name="manualSupplementNutrients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manually Enter Supplement Nutrients (JSON)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="{ \"folate\": 600, \"iron\": 27 }" className="resize-none border-input-border bg-input-background text-input-foreground" {...field} />
                      </FormControl>
                      <FormDescription>Enter nutrients as a JSON object (e.g., {`{"folate": 600, "iron": 27}`}).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="noSupplement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-input-border bg-input-background">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>No supplement currently</FormLabel>
                      <FormDescription>If you are not taking any prenatal vitamins.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {watch("noSupplement") && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
                  <p className="font-bold">Recommendation:</p>
                  <p className="text-sm">
                    We recommend starting a prenatal vitamin containing at least:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Folate (600mcg as methylfolate preferred)</li>
                      <li>Iron (27mg)</li>
                      <li>Calcium (1,000mg)</li>
                      <li>Vitamin D (600 IU minimum)</li>
                      <li>DHA (200mg minimum)</li>
                    </ul>
                    Consider third-party tested brands: USP, NSF, or ConsumerLab verified.
                  </p>
                </div>
              )}
            </form>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-card-border">
        <CardHeader className="border-b border-card-border bg-gradient-to-r from-beetroot/5 to-primary/5">
          <CardTitle className="font-serif text-3xl text-beetroot">Welcome to VeggieFresh Pregnancy!</CardTitle>
          <CardDescription className="text-muted-foreground">Let's get you set up for a healthy pregnancy journey.</CardDescription>
          <Progress value={(step / totalSteps) * 100} className="w-full mt-4" />
        </CardHeader>
        <CardContent className="py-6">
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-card-border bg-gradient-to-r from-beetroot/5 to-primary/5">
          {step > 1 && (
            <VeggieButton variant="secondary" onClick={handleBack}>
              Back
            </VeggieButton>
          )}
          <div className="flex-grow" />
          {step < totalSteps ? (
            <VeggieButton onClick={handleNext}>
              Next
            </VeggieButton>
          ) : (
            <VeggieButton onClick={form.handleSubmit(onSubmit)}>
              Complete Setup
            </VeggieButton>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
