# VeggieFresh - Evidence-Based Pregnancy Nutrition App

A comprehensive nutrition tracking application meticulously designed for pregnancy, featuring an evidence-based onboarding flow, critical safety alerts, and trimester-specific guidance.

## ✨ Core Features

### PHASE 0: Initial User Setup Flow
- **Comprehensive Onboarding**: Collects Last Menstrual Period (LMP), weight, height, dietary preferences, allergies, medical history, and current supplement intake.
- **Gestational Age Calculation**: Automatically calculates and displays the current week and trimester.
- **Privacy-Focused BMI**: Calculates starting BMI for internal logic but only displays the category (e.g., "Normal Weight") to the user.
- **Plant-Based Support**: Provides an informational modal for users selecting vegetarian or vegan diets.
- **Folate Education**: A prominent note in the supplement section educates users on the critical difference between natural Folate and synthetic Folic Acid.

### PHASE 1: Critical Safety Features
- **Vitamin A Teratogenicity Alert System**: Tracks preformed Vitamin A (retinol) separately from safe Beta-carotene, triggering critical alerts at levels known to increase birth defect risks.
- **Iron Management System**: Monitors total daily iron intake with warnings for approaching or exceeding the Tolerable Upper Intake Level (UL) to mitigate risks like constipation and gestational diabetes.
- **Iron-Calcium Interaction Detection**: Alerts users when iron and calcium are consumed within a 2-hour window, explaining the significant reduction in iron absorption and recommending proper spacing.
- **Folic Acid Upper Limit Monitoring**: Tracks synthetic folic acid separately from natural food folate, with warnings for exceeding 1,000mcg to prevent masking a Vitamin B12 deficiency.

### PHASE 2 & 3: Comprehensive Daily Nutrient Tracking
- **All Nutrients Tracked Daily**: Removed the confusing "Weekly Targets" tab and moved all nutrients, including Vitamin D, B12, Choline, and DHA/EPA, to a unified daily view.
- **10+ New Critical Nutrients**: Added daily tracking for Magnesium, Vitamin E, Vitamin K, Copper, Biotin (B7), Pantothenic Acid (B5), Manganese, Chromium, and Molybdenum.
- **Magnesium Educational Note**: A detailed, evidence-based note in the intake form highlights magnesium's role in preventing preeclampsia and leg cramps, its high deficiency rate, and best food sources.

### PHASE 4: BMI-Adjusted Calorie & Protein Recommendations
- **Trimester-Specific Goals**: Calorie and protein goals dynamically adjust based on the user's starting BMI and current trimester. (Note: Calorie adjustments are pending final implementation).

### PHASE 5: Gentle First Trimester Nudging
- **First Trimester Mode**: Replaces standard "nudges" with gentle, encouraging messages focused on rest and self-care, acknowledging the challenges of early pregnancy.

### PHASE 6: Weekly Symptom Check-in System
- **Symptom Logging**: Allows users to log common pregnancy symptoms like nausea, fatigue, and food aversions weekly.
- **Symptom-Responsive Guidance**: Provides immediate, actionable advice based on logged symptoms (e.g., tips for managing nausea, constipation, or leg cramps).
- **Nausea + Low Nutrition Reassurance**: A specialized alert provides comfort and evidence-based reassurance to users experiencing significant nausea coupled with low nutritional intake, emphasizing that this is normal and the baby is still getting nutrients from maternal stores.

### PHASE 7: Enhanced Educational Content
- **Folate vs. Folic Acid Education**: A dialog explains the differences, the importance of methylfolate, and lists high-folate foods.
- **Plant-Based Pregnancy Enhanced Mode**: Activates a "Plant-Based Mode" badge and a dedicated "Key Plant-Based Nutrients" section for users who identify as vegetarian or vegan.
- **Food Suggestion Engine**: Dynamically suggests high-nutrient foods based on the user's current deficits and dietary preferences.

### PHASE 8: UI/UX Enhancements
- **Three-Tiered Visual Alert System**: Nutrient progress bars change color (Green for optimal, Yellow for approaching goal, Orange for exceeding goal, Red for dangerous levels) to provide instant visual feedback.
- **Gestational Age Context**: The user's current week and trimester are displayed prominently in the header for constant context.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- PostgreSQL (for database)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd VeggieFresh
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up your environment variables:**
    Create a `.env` file in the `server` directory and add your PostgreSQL database URL:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
5.  **Open your browser:**
    Navigate to `http://localhost:3000`.

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