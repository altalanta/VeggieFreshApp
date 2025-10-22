import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const meals = pgTable("meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  mealType: text("meal_type").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  iron: real("iron").notNull(),
  vitaminC: real("vitamin_c").notNull(),
  calcium: real("calcium").notNull(),
  folate: real("folate").notNull(),
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  timestamp: true,
}).extend({
  name: z.string().min(1, "Meal name is required"),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  calories: z.number().min(0),
  protein: z.number().min(0),
  iron: z.number().min(0),
  vitaminC: z.number().min(0),
  calcium: z.number().min(0),
  folate: z.number().min(0),
});

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

export interface DailyNutrients {
  calories: number;
  protein: number;
  iron: number;
  vitaminC: number;
  calcium: number;
  folate: number;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  iron: number;
  vitaminC: number;
  calcium: number;
  folate: number;
}
