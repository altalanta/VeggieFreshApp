import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, jsonb, primaryKey, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export interface UserProfile {
  lastMenstrualPeriod?: Date;
  estimatedDueDate?: Date;
  currentWeek?: number;
  currentTrimester?: 1 | 2 | 3;
  prePregnancyWeight?: number;
  prePregnancyWeightUnit?: "kg" | "lbs";
  prePregnancyBMI?: number;
  height?: number;
  dietaryPreferences?: string[];
  foodAllergies?: string[];
  previousNTD?: boolean;
  multiplesPregnancy?: boolean;
  bariatricHistory?: boolean;
  gestationalDiabetesHistory?: boolean;
  preExistingConditions?: string[];
  prenatalVitaminBrand?: string;
  prenatalVitaminNutrients?: Record<string, number>; // Store as key-value pairs of nutrient and amount
}

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authSub: varchar("auth_sub").notNull().unique(),
  profile: jsonb("profile").$type<UserProfile>(), // Use $type to specify the JSONB structure
  dietaryPrefs: jsonb("dietary_prefs"),
  region: varchar("region"),
  units: varchar("units"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  authSub: true,
  profile: true,
  dietaryPrefs: true,
  region: true,
  units: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const pregnancies = pgTable("pregnancies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  conceptionDate: timestamp("conception_date").notNull(),
  trimester: integer("trimester"), // Derived
  outcomes: jsonb("outcomes"),
});
export const insertPregnancySchema = createInsertSchema(pregnancies);
export type InsertPregnancy = z.infer<typeof insertPregnancySchema>;
export type Pregnancy = typeof pregnancies.$inferSelect;

export const foods = pgTable("foods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brand: text("brand"),
  name: text("name").notNull(),
  barcode: text("barcode").unique(),
  source: text("source").notNull(), // USDA|OpenFoodFacts|custom
});
export const insertFoodSchema = createInsertSchema(foods);
export type InsertFood = z.infer<typeof insertFoodSchema>;
export type Food = typeof foods.$inferSelect;

export const intakeEntries = pgTable("intake_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  dateTime: timestamp("date_time").notNull().defaultNow(),
  foodId: varchar("food_id").references(() => foods.id),
  freeText: text("free_text"),
  qty: real("qty").notNull(),
  unit: text("unit").notNull(),
  source: text("source").notNull(), // barcode|ocr|ai|manual
});
export const insertIntakeEntrySchema = createInsertSchema(intakeEntries);
export type InsertIntakeEntry = z.infer<typeof insertIntakeEntrySchema>;
export type IntakeEntry = typeof intakeEntries.$inferSelect;

export const nutrients = pgTable("nutrients", {
  id: varchar("id").primaryKey(), // e.g., choline, DHA, folate
  unit: text("unit").notNull(),
  displayName: text("display_name").notNull(),
  weeklyDailyFlag: text("weekly_daily_flag"),
  isPreformedVitaminA: boolean("is_preformed_vitamin_a").default(false), // New field for Vitamin A differentiation
  isFolicAcid: boolean("is_folic_acid").default(false), // New field for Folic Acid differentiation
});
export const insertNutrientSchema = createInsertSchema(nutrients);
export type InsertNutrient = z.infer<typeof insertNutrientSchema>;
export type Nutrient = typeof nutrients.$inferSelect;

export const intakeNutrients = pgTable("intake_nutrients", {
  entryId: varchar("entry_id").notNull().references(() => intakeEntries.id),
  nutrientId: varchar("nutrient_id").notNull().references(() => nutrients.id),
  amount: real("amount").notNull(),
  confidence: real("confidence"),
}, (table) => ({
  pk: primaryKey(table.entryId, table.nutrientId)
}));
export const insertIntakeNutrientSchema = createInsertSchema(intakeNutrients);
export type InsertIntakeNutrient = z.infer<typeof insertIntakeNutrientSchema>;
export type IntakeNutrient = typeof intakeNutrients.$inferSelect;

export const targets = pgTable("targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  nutrientId: varchar("nutrient_id").notNull().references(() => nutrients.id),
  dailyGoal: real("daily_goal").notNull(),
  upperLimit: real("upper_limit"),
  trackingFrequency: varchar("tracking_frequency").notNull(), // 'daily' | 'weekly'
  trimesterSpecific: jsonb("trimester_specific"), // { first?: number; second?: number; third?: number; }
  bmiAdjusted: boolean("bmi_adjusted").default(false),
});
export const insertTargetSchema = createInsertSchema(targets);
export type InsertTarget = z.infer<typeof insertTargetSchema>;
export type Target = typeof targets.$inferSelect;

export const measurements = pgTable("measurements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  weight: real("weight"),
  waist: real("waist"),
  hip: real("hip"),
  otherCircumferences: jsonb("other_circumferences"),
  photoRefs: jsonb("photo_refs"),
});
export const insertMeasurementSchema = createInsertSchema(measurements);
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;
export type Measurement = typeof measurements.$inferSelect;

export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  uri: text("uri").notNull(),
  meta: jsonb("meta"),
});
export const insertPhotoSchema = createInsertSchema(photos);
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;

export const nudges = pgTable("nudges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  nutrientId: varchar("nutrient_id").references(() => nutrients.id),
  gapSize: real("gap_size"),
  suggestionText: text("suggestion_text"),
  actionTaken: text("action_taken"),
});
export const insertNudgeSchema = createInsertSchema(nudges);
export type InsertNudge = z.infer<typeof insertNudgeSchema>;
export type Nudge = typeof nudges.$inferSelect;

export const foodNutrients = pgTable("food_nutrients", {
  foodId: varchar("food_id").notNull().references(() => foods.id),
  nutrientId: varchar("nutrient_id").notNull().references(() => nutrients.id),
  amountPer100g: real("amount_per_100g").notNull(),
}, (table) => ({
  pk: primaryKey(table.foodId, table.nutrientId)
}));
export const insertFoodNutrientSchema = createInsertSchema(foodNutrients);
export type InsertFoodNutrient = z.infer<typeof insertFoodNutrientSchema>;
export type FoodNutrient = typeof foodNutrients.$inferSelect;

export const weeklySymptoms = pgTable("weekly_symptoms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  week: integer("week").notNull(), // Week of pregnancy
  date: timestamp("date").notNull().defaultNow(),
  nauseaSeverity: varchar("nausea_severity", { enum: ['none', 'mild', 'moderate', 'severe'] }).notNull(),
  fatigueLevel: varchar("fatigue_level", { enum: ['normal', 'slight', 'significant', 'extreme'] }).notNull(),
  foodAversions: varchar("food_aversions", { enum: ['none', 'some', 'many', 'severe'] }).notNull(),
  constipation: boolean("constipation").default(false),
  heartburn: boolean("heartburn").default(false),
  legCramps: boolean("leg_cramps").default(false),
  headaches: boolean("headaches").default(false),
  cravings: boolean("cravings").default(false),
});
export const insertWeeklySymptomsSchema = createInsertSchema(weeklySymptoms);
export type InsertWeeklySymptoms = z.infer<typeof insertWeeklySymptomsSchema>;
export type WeeklySymptoms = typeof weeklySymptoms.$inferSelect;

export const alertHistory = pgTable("alert_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  alertType: text("alert_type").notNull(),
  nutrient: text("nutrient"),
  severity: varchar("severity", { enum: ['info', 'yellow', 'orange', 'red'] }).notNull(),
  message: text("message").notNull(),
  dismissedAt: timestamp("dismissed_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  actionTaken: text("action_taken"),
});
export const insertAlertHistorySchema = createInsertSchema(alertHistory);
export type InsertAlertHistory = z.infer<typeof insertAlertHistorySchema>;
export type AlertHistory = typeof alertHistory.$inferSelect;

export interface DailyNutrients {
  [key: string]: number;
}

export interface DailyGoalEntry {
  dailyGoal: number;
  upperLimit?: number;
}

export interface DailyGoals {
  [key: string]: DailyGoalEntry;
}

export interface WeeklyNutrients {
  [key: string]: number;
}

export interface WeeklyGoals {
  [key: string]: number;
}
