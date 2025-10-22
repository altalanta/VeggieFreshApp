import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMealSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/meals", async (_req, res) => {
    try {
      const meals = await storage.getMeals();
      res.json(meals);
    } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).json({ error: "Failed to fetch meals" });
    }
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const validatedData = insertMealSchema.parse(req.body);
      const meal = await storage.createMeal(validatedData);
      res.status(201).json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Error creating meal:", error);
        res.status(500).json({ error: "Failed to create meal" });
      }
    }
  });

  app.delete("/api/meals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMeal(id);
      
      if (!deleted) {
        res.status(404).json({ error: "Meal not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting meal:", error);
      res.status(500).json({ error: "Failed to delete meal" });
    }
  });

  app.get("/api/nutrients/daily", async (_req, res) => {
    try {
      const today = new Date();
      const dailyNutrients = await storage.getDailyNutrients(today);
      res.json(dailyNutrients);
    } catch (error) {
      console.error("Error fetching daily nutrients:", error);
      res.status(500).json({ error: "Failed to fetch daily nutrients" });
    }
  });

  app.get("/api/goals/daily", async (_req, res) => {
    try {
      const dailyGoals = await storage.getDailyGoals();
      res.json(dailyGoals);
    } catch (error) {
      console.error("Error fetching daily goals:", error);
      res.status(500).json({ error: "Failed to fetch daily goals" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
