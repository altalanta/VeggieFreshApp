import { type User, type InsertUser, type Meal, type InsertMeal, type DailyNutrients, type DailyGoals } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createMeal(meal: InsertMeal): Promise<Meal>;
  getMeals(): Promise<Meal[]>;
  deleteMeal(id: string): Promise<boolean>;
  getDailyNutrients(date: Date): Promise<DailyNutrients>;
  getDailyGoals(): Promise<DailyGoals>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private meals: Map<string, Meal>;

  constructor() {
    this.users = new Map();
    this.meals = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const id = randomUUID();
    const meal: Meal = {
      ...insertMeal,
      id,
      timestamp: new Date(),
    };
    this.meals.set(id, meal);
    return meal;
  }

  async getMeals(): Promise<Meal[]> {
    return Array.from(this.meals.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  async deleteMeal(id: string): Promise<boolean> {
    return this.meals.delete(id);
  }

  async getDailyNutrients(date: Date): Promise<DailyNutrients> {
    const meals = Array.from(this.meals.values()).filter((meal) => {
      const mealDate = new Date(meal.timestamp);
      return (
        mealDate.getDate() === date.getDate() &&
        mealDate.getMonth() === date.getMonth() &&
        mealDate.getFullYear() === date.getFullYear()
      );
    });

    return meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
        iron: totals.iron + meal.iron,
        vitaminC: totals.vitaminC + meal.vitaminC,
        calcium: totals.calcium + meal.calcium,
        folate: totals.folate + meal.folate,
      }),
      {
        calories: 0,
        protein: 0,
        iron: 0,
        vitaminC: 0,
        calcium: 0,
        folate: 0,
      }
    );
  }

  async getDailyGoals(): Promise<DailyGoals> {
    return {
      calories: 2200,
      protein: 71,
      iron: 27,
      vitaminC: 85,
      calcium: 1000,
      folate: 600,
    };
  }
}

export const storage = new MemStorage();
