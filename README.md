# VeggieFresh – Evidence-Based Pregnancy Nutrition

VeggieFresh helps expectant parents log meals, monitor 40+ prenatal nutrients, and receive trimester-aware guidance rooted in current research (NIH, ACOG, WHO). The app emphasizes inclusion for plant-based pregnancies while protecting against the biggest nutrient safety risks.

## ✨ Highlights

- **Guided Onboarding:** Collects LMP, calculates gestational age, captures weight/height (with BMI category only), dietary preferences, allergies, medical history, and supplement details. Includes methylfolate vs. folic acid education and plant-based considerations up front.
- **Daily-First Tracking:** All nutrients – including Vitamin D, B12, Choline, DHA/EPA, magnesium, vitamin K, etc. – are tracked daily with dynamic defaults and upper limits. The UI focuses on a single “Daily Nutrition” view; a weekly average summary sits below.
- **Trimester-Aware Goals:** Calorie and protein targets auto-adjust using BMI, trimester, and baseline energy needs. Users see explanatory copy (“Second trimester: +340 kcal/day”) plus food ideas.
- **Plant-Based Mode:** Vegan/vegetarian users get a badge, a “Plant-Based Pregnancy Check” card for B12/iron/zinc/choline/DHA/calcium/iodine, vegan-friendly nudges (e.g., algae-based DHA), and filtered food suggestions tied to preferences/allergies.
- **Safety Systems:** Separate tracking for preformed vitamin A vs. beta-carotene, synthetic vs. natural folate, iron UL tiers, and iron–calcium timing interactions. Alerts escalate from gentle to critical (toast, card, modal) with actionable guidance.
- **Gentle First Trimester Experience:** Encouraging nudges, neutral color language, reassurance copy when intake is low, and celebration messages when anything is logged—while still surfacing high-risk alerts instantly.
- **Weekly Symptom Check-ins:** Nausea/fatigue/aversions plus symptom-specific tips (magnesium for cramps, fiber + hydration for constipation). Severe nausea + <50% intake triggers compassionate reassurance.

## 🛠 Tech Stack

- **Frontend:** React + TypeScript, Vite, Tailwind (custom VeggieFresh theme), React Query.
- **Backend:** Node/Express with Drizzle ORM and Neon/Postgres storage.
- **Shared Layer:** Type-safe schema definitions and default nutrient goals exported for both client and server.

## 🚀 Getting Started

```bash
git clone <repo>
cd VeggieFresh
npm install
npm run dev
```

Set `DATABASE_URL` in `server/.env` (Neon/Postgres). The dev server hosts both API and SPA via Vite.

## 🧭 Feature Tour

| Area | What you’ll see |
| --- | --- |
| **Onboarding** | Six steps (LMP calendar, measurements with BMI-only UI, dietary prefs with modal, allergies, medical history, supplements). Displays trimester-specific calorie/protein guidance when enough data exists. |
| **Home Header** | Personalized calorie/protein goal breakdown (“Baseline vs. Trimester Goal”), trimester badges, due-date context, Plant-Based badge when applicable. |
| **Daily Nutrition** | Progress bars with goal + UL markers (color-coded 3-tier alert system), grouped sections (macros, micros, B-complex, trace minerals, specialized). Plant-based users get a highlighted nutrient section. |
| **Weekly Average** | Compact card summarizing 7-day averages for key nutrients (calories, iron, calcium, choline, vitamin D, DHA, etc.). |
| **Nudges & Suggestions** | Trend-based suggestions, plant-based alerts (B12, iron absorption, choline), gentle messages during trimester 1, plus food suggestions filtered by preferences/allergies. |
| **Logging Intake** | Detailed nutrient form covering macros, micros, folate forms, vitamin A forms, magnesium, trace minerals, DHA/EPA. Includes magnesium education block. |
| **Symptom Check-ins** | Weekly dialog capturing nausea/fatigue/aversions/constipation/heartburn/cramps/headaches/cravings with targeted follow-ups (e.g., B6 for nausea, magnesium for cramps). |

## ✅ Safety Rails

- Red alert >10,000 IU preformed vitamin A; orange warning ≥8,000 IU in trimester 1.
- Synthetic folic acid UL at 1,000 mcg (with 4,000 mcg exemption for previous NTD flag).
- Iron UL warnings (yellow 40–44 mg, orange ≥45 mg) + every-other-day tip.
- Automatic detection of iron + calcium within a 2-hour window (explains absorption drop, suggests spacing & vitamin C).
- Alert history stored for audit trails (via `alert_history` table).

## 📈 Roadmap Snippets

- Extend gentle-first-trimester mode with optional pacing settings.
- Integrate actual authentication and user seats (currently using placeholder ID).
- Expand food database seeding + barcode search (endpoints already scaffolded).

## 🤝 Contributing

1. Fork / branch from `main`.
2. Keep TypeScript strictness & linting in mind.
3. Use `rg` for search, `apply_patch` for succinct edits.
4. Submit PRs with context around nutrition logic changes (cite research when possible).

VeggieFresh aims to remove fear and confusion from pregnancy nutrition—especially for plant-based parents—while surfacing real risks with empathy. Dive in, explore the personalized flows, and help us keep building an evidence-backed companion for the prenatal journey. 🌱💛
