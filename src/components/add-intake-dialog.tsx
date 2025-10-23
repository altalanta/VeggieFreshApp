import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VeggieButton } from "@/components/ui/veggie-button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { checkNutrientAlert, checkVitaminAAlert, Alert } from "@/utils/nutrient-alerts";
import { type IntakeEntry, type InsertIntakeEntry, type InsertIntakeNutrient, type UserProfile, type NutrientGoals } from "@shared/schema";
import { FolateEducationDialog } from "./folate-education-dialog";

const PLACEHOLDER_USER_ID = "test-user-id"; // Placeholder until actual auth is implemented

const formSchema = z.object({
  foodName: z.string().min(1, "Food name is required"),
  quantity: z.coerce.number().min(0.1, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  // Basic Macronutrients (adjust as needed based on actual nutrient IDs)
  calories: z.coerce.number().min(0).optional().default(0),
  protein: z.coerce.number().min(0).optional().default(0),
  fat: z.coerce.number().min(0).optional().default(0),
  carbohydrates: z.coerce.number().min(0).optional().default(0),
  fiber: z.coerce.number().min(0).optional().default(0),
  // Vitamins & Minerals
  iron: z.coerce.number().min(0).optional().default(0),
  folate_natural: z.coerce.number().min(0).optional().default(0), // Natural food folate
  folate_synthetic: z.coerce.number().min(0).optional().default(0), // Synthetic folic acid
  vitaminC: z.coerce.number().min(0).optional().default(0),
  vitaminA_preformed: z.coerce.number().min(0).optional().default(0), // Preformed Vitamin A (Retinol)
  vitaminA_betaCarotene: z.coerce.number().min(0).optional().default(0), // Beta-carotene
  calcium: z.coerce.number().min(0).optional().default(0),
  zinc: z.coerce.number().min(0).optional().default(0),
  selenium: z.coerce.number().min(0).optional().default(0),
  iodine: z.coerce.number().min(0).optional().default(0),
  magnesium: z.coerce.number().min(0).optional().default(0), // New: Magnesium
  vitaminE: z.coerce.number().min(0).optional().default(0), // New: Vitamin E
  vitaminK: z.coerce.number().min(0).optional().default(0), // New: Vitamin K
  copper: z.coerce.number().min(0).optional().default(0), // New: Copper
  biotin: z.coerce.number().min(0).optional().default(0), // New: Biotin (B7)
  pantothenicAcid: z.coerce.number().min(0).optional().default(0), // New: Pantothenic Acid (B5)
  manganese: z.coerce.number().min(0).optional().default(0), // New: Manganese
  chromium: z.coerce.number().min(0).optional().default(0), // New: Chromium
  molybdenum: z.coerce.number().min(0).optional().default(0), // New: Molybdenum
  // B-Complex
  vitaminB1: z.coerce.number().min(0).optional().default(0),
  vitaminB2: z.coerce.number().min(0).optional().default(0),
  vitaminB3: z.coerce.number().min(0).optional().default(0),
  vitaminB6: z.coerce.number().min(0).optional().default(0),
  vitaminB12: z.coerce.number().min(0).optional().default(0), // Moved to daily tracking
  // Electrolytes & Fluids
  sodium: z.coerce.number().min(0).optional().default(0),
  potassium: z.coerce.number().min(0).optional().default(0),
  water: z.coerce.number().min(0).optional().default(0),
  // Weekly (now daily) Specialized Nutrients
  choline: z.coerce.number().min(0).optional().default(0),
  dha: z.coerce.number().min(0).optional().default(0),
  epa: z.coerce.number().min(0).optional().default(0),
  vitaminD: z.coerce.number().min(0).optional().default(0), // Moved to daily tracking
});

type IntakeFormValues = z.infer<typeof formSchema>;

interface AddIntakeDialogProps {
  onAddIntakeSuccess: () => void;
  isPending?: boolean;
}

export function AddIntakeDialog({ onAddIntakeSuccess, isPending }: AddIntakeDialogProps) {
  const [open, setOpen] = useState(false);
  const [macrosOpen, setMacrosOpen] = useState(true);
  const [vitaminsOpen, setVitaminsOpen] = useState(true); // Open by default for important alerts
  const [bComplexOpen, setBComplexOpen] = useState(false);
  const [electrolyteOpen, setElectrolyteOpen] = useState(false);
  const [traceMineralsOpen, setTraceMineralsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: "",
      quantity: 1,
      unit: "serving",
      calories: 0, protein: 0, fat: 0, carbohydrates: 0, fiber: 0,
      iron: 0, folate_natural: 0, folate_synthetic: 0, vitaminC: 0, vitaminA_preformed: 0, vitaminA_betaCarotene: 0,
      calcium: 0, zinc: 0, selenium: 0, iodine: 0,
      magnesium: 0, vitaminE: 0, vitaminK: 0, copper: 0, biotin: 0, pantothenicAcid: 0, manganese: 0, chromium: 0, molybdenum: 0,
      vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB6: 0, vitaminB12: 0,
      sodium: 0, potassium: 0, water: 0,
      choline: 0, dha: 0, epa: 0, vitaminD: 0,
    },
  });

  const handleSubmit = async (data: IntakeFormValues) => {
    try {
      const intakeEntry: InsertIntakeEntry = {
        userId: PLACEHOLDER_USER_ID,
        freeText: data.foodName,
        qty: data.quantity,
        unit: data.unit,
        source: "manual", // For now, assuming manual entry
        dateTime: new Date(),
      };

      const newEntry = await apiRequest("POST", "/api/intake-entries", intakeEntry);

      const nutrientsToLog: Omit<InsertIntakeNutrient, 'id'>[] = [];
      for (const key in data) {
        // @ts-ignore
        if (formSchema.shape[key] && typeof data[key] === 'number' && data[key] > 0) {
          const nutrientId = key; // Use key as nutrientId (e.g., 'calories', 'protein', 'iron')
          nutrientsToLog.push({
            entryId: newEntry.id,
            nutrientId: nutrientId,
            // @ts-ignore
            amount: data[key],
            confidence: 1.0, // Manual entries are high confidence
          });
        }
      }

      if (nutrientsToLog.length > 0) {
        await apiRequest("POST", "/api/intake-nutrients", nutrientsToLog);
      }

      // After successful intake, fetch user profile and all daily intake for alerts
      const userProfile: UserProfile = await apiRequest("GET", `/api/users/profile/${PLACEHOLDER_USER_ID}`);
      const dailyIntakeEntries: IntakeEntry[] = await apiRequest("GET", `/api/intake-entries/${PLACEHOLDER_USER_ID}?date=${new Date().toISOString()}`);

      // Aggregate nutrient totals for the day for alert checking
      const dailyNutrientTotals: { [key: string]: number } = {};
      const entriesWithNutrients = await Promise.all(
        dailyIntakeEntries.map(async (entry) => {
          const nutrients: InsertIntakeNutrient[] = await apiRequest("GET", `/api/intake-nutrients/${entry.id}`);
          for (const n of nutrients) {
            dailyNutrientTotals[n.nutrientId] = (dailyNutrientTotals[n.nutrientId] || 0) + n.amount;
          }
          return { ...entry, nutrients };
        })
      );

      // Fetch nutrient goals for the user
      const userGoals: NutrientGoals[] = await apiRequest("GET", `/api/targets/${PLACEHOLDER_USER_ID}?trimester=${userProfile.currentTrimester || 1}`);
      const goalsMap = userGoals.reduce((acc, goal) => { 
        // @ts-ignore
        acc[goal.nutrientId] = goal; 
        return acc;
      }, {} as { [key: string]: NutrientGoals });

      // Check for alerts
      const alerts: Alert[] = [];
      for (const nutrientId in dailyNutrientTotals) {
        const nutrientGoals = goalsMap[nutrientId];
        if (nutrientGoals) { // Only check if goals exist for the nutrient
          const alert = checkNutrientAlert(nutrientId, dailyNutrientTotals[nutrientId], nutrientGoals, userProfile, dailyIntakeEntries);
          if (alert) alerts.push(alert);
        }
      }

      // Explicitly check for Vitamin A alert
      if (userProfile.currentTrimester && dailyNutrientTotals.vitaminA_preformed) {
        const vitaminAAlert = checkVitaminAAlert(dailyNutrientTotals.vitaminA_preformed, userProfile.currentTrimester);
        if (vitaminAAlert) {
          alerts.push(vitaminAAlert);
        }
      }
      
      // Iron-Calcium Interaction Check
      if (data.iron > 0 || data.calcium > 0) {
        const twoHours = 2 * 60 * 60 * 1000;
        const ironEntries = entriesWithNutrients.filter(e => e.nutrients.some(n => n.nutrientId === 'iron' && n.amount > 0));
        const calciumEntries = entriesWithNutrients.filter(e => e.nutrients.some(n => n.nutrientId === 'calcium' && n.amount > 0));

        for (const ironEntry of ironEntries) {
          for (const calciumEntry of calciumEntries) {
            const timeDiff = Math.abs(new Date(ironEntry.dateTime).getTime() - new Date(calciumEntry.dateTime).getTime());
            if (timeDiff < twoHours) {
              alerts.push({
                severity: 'yellow',
                title: '💡 Iron & Calcium Interaction Alert',
                message: `Taking iron and calcium supplements or high-calcium foods (like dairy) together can reduce iron absorption by up to 67%. 
                
                Recommendations:
                • Space iron and calcium intake at least 2 hours apart.
                • Take iron with a source of Vitamin C (like orange juice) to boost absorption.`,
                actions: ['Dismiss']
              });
              // Break loops after finding one interaction to avoid duplicate alerts
              break;
            }
          }
          if (alerts.some(a => a.title.includes('Iron & Calcium'))) break;
        }
      }

      // Display alerts
      for (const alert of alerts) {
        toast({
          title: alert.title,
          description: alert.message,
          variant: alert.severity === 'red' || alert.severity === 'orange' ? "destructive" : undefined,
          // Add more customization for actions/dismissible if needed
        });
      }

      const inGentleMode = userProfile.currentTrimester === 1;
      const successTitle = inGentleMode ? "Nice job nourishing yourself today 💛" : "Meal Logged!";
      const successDescription = inGentleMode
        ? `Every bite counts right now—${data.foodName} is a win worth celebrating.`
        : `Successfully added ${data.foodName}.`;

      toast({
        title: successTitle,
        description: successDescription,
      });
      onAddIntakeSuccess();
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error logging meal:", error);
      toast({
        title: "Failed to Log Meal",
        description: "There was an error logging your meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <VeggieButton 
          variant="primary" 
          data-testid="button-add-intake"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Log Intake
        </VeggieButton>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Log Intake</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="foodName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Spinach Salad, Prenatal Vitamin" 
                      data-testid="input-food-name"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.1"
                        min="0.1"
                        data-testid="input-quantity"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., cup, grams, tablet" 
                        data-testid="input-unit"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Collapsible open={macrosOpen} onOpenChange={setMacrosOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-medium text-sm hover:text-primary">
                {macrosOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Macronutrients
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protein (g)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fat (g)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="carbohydrates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carbs (g)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fiber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fiber (g)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={vitaminsOpen} onOpenChange={setVitaminsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-medium text-sm hover:text-primary">
                {vitaminsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Key Vitamins & Minerals
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="iron"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Iron (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="folate_natural"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Folate (mcg, Natural)</FormLabel>
                          <FolateEducationDialog />
                        </div>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="folate_synthetic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Folic Acid (mcg, Synthetic)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminC"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin C (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminA_preformed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin A (IU, Preformed)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormDescription>Retinol, Retinyl Esters from animal sources.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="vitaminA_betaCarotene"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin A (mcg, Beta-carotene)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormDescription>From plant sources - no upper limit.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="calcium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calcium (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zinc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zinc (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="selenium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selenium (mcg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iodine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Iodine (mcg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="magnesium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Magnesium (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminE"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin E (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminK"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin K (mcg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="copper"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Copper (mcg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 my-4 rounded-md shadow-sm" role="alert">
              <p className="font-bold text-lg">Magnesium: A Pregnancy Powerhouse</p>
              <p className="text-sm mt-2">
                Magnesium is one of the most commonly deficient nutrients in pregnancy (up to 53% of women), 
                yet it's critical for:
              </p>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  <li><strong>Preventing leg cramps</strong></li>
                  <li><strong>Reducing preeclampsia risk by 24%</strong></li>
                  <li><strong>Reducing preterm birth by 42%</strong></li>
                  <li>Supporting baby's bone development</li>
              </ul>
              <p className="text-sm mt-2 font-semibold">Best food sources:</p>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                <li><strong>Pumpkin seeds:</strong> 156mg per oz</li>
                <li><strong>Almonds:</strong> 80mg per oz</li>
                <li><strong>Spinach:</strong> 78mg per 1/2 cup cooked</li>
                <li><strong>Black beans:</strong> 60mg per 1/2 cup</li>
              </ul>
            </div>

            <Collapsible open={bComplexOpen} onOpenChange={setBComplexOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-medium text-sm hover:text-primary">
                {bComplexOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                B-Complex Vitamins (Daily)
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="vitaminB1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>B1 Thiamine (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminB2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>B2 Riboflavin (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminB3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>B3 Niacin (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminB6"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>B6 (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="biotin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biotin (mcg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pantothenicAcid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pantothenic Acid (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminB12"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin B12 (mcg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={electrolyteOpen} onOpenChange={setElectrolyteOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-medium text-sm hover:text-primary">
                {electrolyteOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Electrolytes & Fluids
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="sodium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sodium (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="potassium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potassium (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="water"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Water (ml)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={traceMineralsOpen} onOpenChange={setTraceMineralsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-medium text-sm hover:text-primary">
                {traceMineralsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Trace Minerals (Daily)
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="manganese"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manganese (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chromium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chromium (mcg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="molybdenum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Molybdenum (mcg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={false} onOpenChange={() => {}}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-medium text-sm hover:text-primary">
                <ChevronRight className="h-4 w-4" />
                Omega-3s (Daily)
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="dha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DHA (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="epa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EPA (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="choline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Choline (mg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="vitaminD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vitamin D (mcg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex gap-3 pt-2">
              <VeggieButton
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
                className="flex-1"
              >
                Cancel
              </VeggieButton>
              <VeggieButton
                type="submit"
                variant="primary"
                disabled={isPending}
                data-testid="button-submit-intake"
                className="flex-1"
              >
                {isPending ? "Adding..." : "Log Intake"}
              </VeggieButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
