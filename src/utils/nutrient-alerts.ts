import { UserProfile, NutrientGoals, AlertHistory, IntakeEntry } from "@shared/schema";

export interface Alert {
  severity: 'info' | 'yellow' | 'orange' | 'red';
  title: string;
  message: string;
  actions?: string[];
  nutrientId?: string;
  dismissible?: boolean;
}

export function checkVitaminAAlert(
  preformedAmount: number,
  trimester: 1 | 2 | 3
): Alert | null {
  if (preformedAmount >= 10000) {
    return {
      severity: 'red',
      title: '🚨 VITAMIN A TOXICITY RISK - IMMEDIATE ACTION NEEDED',
      message: `You've exceeded the safe upper limit for vitamin A in pregnancy (10,000 IU). 
      Preformed vitamin A at this level increases birth defect risk by 4.8 times, 
      particularly affecting:
      • Facial development (craniofacial abnormalities)
      • Heart formation
      • Central nervous system
      
      STOP consuming:
      • Liver and pâté
      • Cod liver oil
      • High-dose vitamin A supplements
      
      Contact your healthcare provider today if you've had multiple days above 10,000 IU.`,
      actions: ['Contact Provider', 'Learn More']
    };
  }
  
  if (preformedAmount >= 8000 && trimester === 1) {
    return {
      severity: 'orange',
      title: '⚠️ HIGH VITAMIN A - CAUTION NEEDED',
      message: `You've consumed ${preformedAmount} IU of preformed vitamin A today. 
      During early pregnancy (your current trimester), amounts above 10,000 IU can 
      significantly increase risk of birth defects affecting the face, heart, and brain.`,
      actions: ['Dismiss', 'Learn More']
    };
  }
  
  return null;
}

/**
 * Checks nutrient intake against goals and upper limits to generate alerts.
 * @param nutrientId The ID of the nutrient being checked.
 * @param currentAmount The current total intake of the nutrient for the period (daily/weekly).
 * @param goals The defined goals for the nutrient.
 * @param userProfile The user's profile information.
 * @returns An Alert object if a threshold is met, otherwise null.
 */
export function checkNutrientAlert(
  nutrientId: string,
  currentAmount: number,
  goals: NutrientGoals,
  userProfile: UserProfile,
  allIntakeEntries: IntakeEntry[] // For iron-calcium interaction
): Alert | null {
  const trimester = userProfile.currentTrimester;
  
  if (nutrientId === 'vitaminA_preformed' && trimester) {
    return checkVitaminAAlert(currentAmount, trimester);
  }

  // Iron Management System
  if (nutrientId === 'iron') {
    const IRON_GOAL = goals.dailyGoal || 27; // Default to 27mg if not set
    const IRON_UPPER_LIMIT = goals.upperLimit || 45; // Default to 45mg if not set

    if (currentAmount >= IRON_UPPER_LIMIT) {
      return {
        severity: 'orange',
        title: '⚠️ Exceeding Safe Iron Limit',
        message: `Current intake: ${currentAmount.toFixed(0)}mg (limit: ${IRON_UPPER_LIMIT}mg). High iron is associated with constipation and may increase gestational diabetes risk. If supplementing, consider an every-other-day dosing option.`,
        actions: ['Dismiss'],
        nutrientId: nutrientId,
        dismissible: true,
      };
    }
    if (currentAmount >= 40 && currentAmount < IRON_UPPER_LIMIT) { // 40-44mg
      return {
        severity: 'yellow',
        title: 'Approaching Safe Iron Upper Limit',
        message: `You're approaching the safe upper limit for iron (${IRON_UPPER_LIMIT}mg), which can increase constipation and risk of gestational diabetes.`,
        actions: ['Dismiss'],
        nutrientId: nutrientId,
        dismissible: true,
      };
    }
    if (currentAmount < IRON_GOAL && currentAmount > 0) {
      // This alert should be informational and trigger if several days below goal, not immediately daily
      // For now, a simple daily check, to be refined later with trend tracking.
      return {
        severity: 'info',
        title: 'Low Iron Intake',
        message: `Your iron intake has been low today. Iron prevents anemia and supports your baby's brain development. Good sources: lean beef, beans, fortified cereal.`,
        actions: ['Dismiss'],
        nutrientId: nutrientId,
        dismissible: true,
      };
    }
  }

  // Folic Acid Upper Limit Monitoring
  if (nutrientId === 'folate_synthetic') { // Assuming a separate ID for synthetic folic acid
    const FOLIC_ACID_UPPER_LIMIT = 1000;
    const NTD_HIGH_DOSE_FOLATE = 4000;

    if (currentAmount >= FOLIC_ACID_UPPER_LIMIT && userProfile.previousNTD) {
       // No alert for users on high-dose protocol, but we can provide a gentle reminder if they go way over the protocol dose.
       if (currentAmount > NTD_HIGH_DOSE_FOLATE + 1000) { // e.g., >5000mcg
         return {
            severity: 'yellow',
            title: 'High-Dose Folate Reminder',
            message: `Your intake of ${currentAmount.toFixed(0)}mcg is above the standard high-dose protocol (${NTD_HIGH_DOSE_FOLATE}mcg). Please ensure this is under the guidance of your healthcare provider.`,
            actions: ['Dismiss'],
            nutrientId: nutrientId,
            dismissible: true,
         }
       }
       return null; // Otherwise, no alert for them under the high dose.
     }

    if (currentAmount >= FOLIC_ACID_UPPER_LIMIT) {
      return {
        severity: 'orange',
        title: '⚠️ Synthetic Folic Acid Upper Limit Reached',
        message: `Your intake of synthetic folic acid is ${currentAmount.toFixed(0)}mcg. The recommended upper limit is ${FOLIC_ACID_UPPER_LIMIT}mcg to avoid masking a potential Vitamin B12 deficiency, which is crucial for nerve health. Natural food folate does NOT have this risk.`,
        actions: ['Dismiss', 'Learn More about Folate vs Folic Acid'],
        nutrientId: nutrientId,
        dismissible: true,
      };
    }
  }

  return null;
}

/**
 * Checks for iron-calcium interaction within a 2-hour window.
 * @param userId The ID of the user.
 * @param intakeEntries All intake entries for the day.
 * @returns An Alert object if an interaction is detected, otherwise null.
 */
export function checkIronCalciumInteraction(userId: string, allIntakeEntries: IntakeEntry[]): Alert | null {
  // This logic requires nutrient data per entry, which is a bit complex here.
  // The logic inside add-intake-dialog is better suited to handle this for now.
  // We will expand this function later if needed for background processing.
  return null;
}
