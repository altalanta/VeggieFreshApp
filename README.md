# VeggieFresh - Enhanced Nutrition Tracking App

A comprehensive nutrition tracking application designed for pregnancy health, featuring daily and weekly nutrient monitoring with detailed progress tracking.

## New Features (Enhanced Nutrition Tracking)

### Daily Nutrition Tracking
- **Macronutrients**: Calories, protein, fat, carbohydrates, fiber
- **Key Vitamins & Minerals**: Iron, folate, Vitamin C, Vitamin A, calcium, zinc, selenium, iodine
- **B-Complex Vitamins**: B1 (thiamine), B2 (riboflavin), B3 (niacin), B6
- **Electrolytes & Fluids**: Sodium, potassium, water

### Weekly Specialized Nutrients
- **Choline**: Essential for fetal brain development
- **DHA/EPA (Omega-3s)**: Critical for neural development
- **Vitamin D**: Important for bone health
- **Vitamin B12**: Essential for nervous system development

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)

## Quick Start (If You're Having npm Issues)

If you're experiencing npm cache permission issues, here's the fastest way to test the app:

1. **Navigate to the project:**
   ```bash
   cd VeggieFresh
   ```

2. **Check if dependencies exist:**
   ```bash
   ls node_modules
   ```

3. **If node_modules exists, start directly with npx:**
   ```bash
   NODE_ENV=development npx tsx server/index.ts
   ```

4. **Open browser to:** `http://localhost:5000`

### Installation & Setup

1. **Clone and navigate to the repository:**
   ```bash
   git clone <your-repo-url>
   cd VeggieFresh
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   **If you encounter permission issues with npm cache:**
   ```bash
   # Fix npm permissions
   sudo chown -R $(whoami) ~/.npm
   npm cache clean --force
   npm install
   ```
   
   **Alternative if npm install continues to fail:**
   ```bash
   # Use yarn instead
   npm install -g yarn
   yarn install
   ```
   
   **Or use npx directly (if node_modules exists):**
   ```bash
   # Check if dependencies are already installed
   ls node_modules
   # If they exist, you can proceed to step 3
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   **Alternative methods if npm run dev fails:**
   ```bash
   # Method 1: Use npx directly
   npx tsx server/index.ts
   
   # Method 2: Use yarn (if installed)
   yarn dev
   
   # Method 3: Manual start with node (if tsx is globally installed)
   NODE_ENV=development tsx server/index.ts
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5000` (or the port shown in your terminal)

## Testing the Enhanced Nutrition Features

### 1. Test Daily Nutrition Tracking

**Home Page - Daily Nutrition Tab:**
- Navigate to the home page
- Click on "Daily Nutrition" tab (should be selected by default)
- Observe the organized nutrient categories:
  - Macronutrients section
  - Key Vitamins & Minerals section  
  - B-Complex Vitamins section
  - Electrolytes & Fluids section

**Add a Meal with New Nutrients:**
- Click "Log Meal" button
- Fill in meal name (e.g., "Spinach Salmon Salad")
- Select meal type (breakfast, lunch, dinner, snack)
- Expand "Macronutrients (Required)" section:
  - Add calories (e.g., 450)
  - Add protein (e.g., 35g)
  - Add fat (e.g., 20g)
  - Add carbohydrates (e.g., 15g)
  - Add fiber (e.g., 8g)
- Expand "Key Vitamins & Minerals" section:
  - Add iron (e.g., 5.2mg)
  - Add vitamin A (e.g., 150mcg)
  - Add zinc (e.g., 2.5mg)
  - Add selenium (e.g., 45mcg)
- Click "Add Meal"

### 2. Test Weekly Nutrition Tracking

**Home Page - Weekly Targets Tab:**
- Click on "Weekly Targets" tab
- Observe specialized nutrients tracking:
  - Choline progress bar
  - DHA (Omega-3) progress bar
  - EPA (Omega-3) progress bar
  - Vitamin D progress bar
  - Vitamin B12 progress bar

**Add Weekly Nutrients:**
- Click "Log Meal" again
- Expand "Weekly Specialized Nutrients" section:
  - Add choline (e.g., 125mg)
  - Add DHA (e.g., 80mg)
  - Add EPA (e.g., 60mg)
  - Add vitamin D (e.g., 3.5mcg)
  - Add vitamin B12 (e.g., 1.2mcg)
- Submit the meal
- Check weekly tab to see progress updates

### 3. Test Enhanced Food Log

**Navigate to Food Log:**
- Click "View Full Log" button from home page
- Observe the enhanced "Today's Totals" card with categorized nutrients:
  - Macronutrients section
  - Key Vitamins & Minerals section
  - B-Complex Vitamins section
  - Electrolytes & Fluids section
  - Weekly Targets section (showing current week totals)

### 4. Test Collapsible Meal Entry

**Advanced Meal Entry:**
- Try adding a comprehensive meal with nutrients from all categories
- Test the collapsible sections (click arrows to expand/collapse):
  - Macronutrients (starts expanded)
  - Key Vitamins & Minerals (starts collapsed)
  - B-Complex Vitamins (starts collapsed)
  - Electrolytes & Fluids (starts collapsed)
  - Weekly Specialized Nutrients (starts collapsed)

## Sample Test Data

Here's some realistic sample data you can use for testing:

### High-Nutrition Meal Example: "Quinoa Salmon Bowl"
```
Macronutrients:
- Calories: 520
- Protein: 42g
- Fat: 18g
- Carbohydrates: 45g
- Fiber: 6g

Key Vitamins & Minerals:
- Iron: 4.2mg
- Folate: 85mcg
- Vitamin C: 25mg
- Vitamin A: 180mcg
- Calcium: 120mg
- Zinc: 3.1mg
- Selenium: 55mcg
- Iodine: 45mcg

B-Complex Vitamins:
- B1 (Thiamine): 0.3mg
- B2 (Riboflavin): 0.4mg
- B3 (Niacin): 8.5mg
- B6: 0.8mg

Electrolytes & Fluids:
- Sodium: 420mg
- Potassium: 680mg
- Water: 200ml

Weekly Specialized Nutrients:
- Choline: 95mg
- DHA: 150mg
- EPA: 110mg
- Vitamin D: 8.2mcg
- Vitamin B12: 2.1mcg
```

### Quick Snack Example: "Greek Yogurt with Berries"
```
Macronutrients:
- Calories: 180
- Protein: 15g
- Fat: 3g
- Carbohydrates: 22g
- Fiber: 4g

Key Vitamins & Minerals:
- Calcium: 200mg
- Vitamin C: 15mg
- Zinc: 1.2mg

Weekly Specialized Nutrients:
- Vitamin B12: 0.8mcg
```

## Pregnancy-Specific Daily Goals

The app uses scientifically-based daily goals for pregnancy:
- **Calories**: 2200 kcal
- **Protein**: 71g
- **Fat**: 73g (30% of calories)
- **Iron**: 27mg
- **Folate**: 600mcg
- **Calcium**: 1000mg
- **Vitamin D**: 15mcg/day (105mcg/week)
- **Choline**: 450mg/day (3150mg/week)
- **DHA**: 200mg/day (1400mg/week)

## 🛠 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## Project Structure

```
VeggieFresh/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── daily-nutrition-progress.tsx    # NEW
│   │   │   │   ├── weekly-nutrition-progress.tsx   # NEW
│   │   │   │   ├── nutrient-progress.tsx
│   │   │   │   └── ...
│   │   │   ├── add-meal-dialog.tsx  # ENHANCED
│   │   │   └── meal-card.tsx
│   │   ├── pages/
│   │   │   ├── home.tsx            # ENHANCED
│   │   │   └── food-log.tsx        # ENHANCED
│   │   └── ...
├── server/                         # Express backend
│   ├── routes.ts                   # ENHANCED
│   ├── storage.ts                  # ENHANCED
│   └── ...
├── shared/
│   └── schema.ts                   # ENHANCED
└── README.md                       # NEW
```

## Troubleshooting

### Common Issues:

1. **npm install fails with permission errors:**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   npm cache clean --force
   npm install
   ```

2. **Port already in use:**
   - Check if another instance is running
   - Kill existing processes: `pkill -f "npm run dev"`
   - Or use a different port in the configuration

3. **TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

4. **Development server won't start:**
   - Ensure Node.js version is 18+
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## Features to Test

- [ ] Daily nutrition progress bars with all new nutrients
- [ ] Weekly nutrition tracking for specialized nutrients
- [ ] Tabbed interface switching between daily/weekly views
- [ ] Collapsible sections in meal entry dialog
- [ ] Enhanced food log with categorized nutrient display
- [ ] Meal deletion and data persistence
- [ ] Progress bars updating in real-time
- [ ] Goal completion badges
- [ ] Responsive design on different screen sizes

## Contributing

This app uses pregnancy-specific nutritional guidelines. When adding new features, please ensure they align with current prenatal nutrition recommendations.

---

**Happy Testing! **

For questions or issues, please check the troubleshooting section above.
