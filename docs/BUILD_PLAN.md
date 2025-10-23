# VeggieFresh Pregnancy — Build Plan

> Goal: “Macrofactor for pregnancy & interpregnancy nutrition,” with flexible visualizations, rich intake capture (barcode, label OCR, AI), and trimester-aware nudging that respects user preferences/restrictions.

## 0) Foundations & Repo Hygiene (Day 0–1)
- [ ] Create monorepo-ish structure (already present: `client/`, `server/`, `shared/`). :contentReference[oaicite:1]{index=1}
- [ ] Add `docs/` for PRD & plans; `config/` for machine-readable rules; `db/` for migrations.
- [ ] Introduce strict TypeScript settings (`tsconfig.strict`), lint, format (ESLint + Prettier).
- [ ] Add CI: build, test, typecheck on PRs; `lint-staged` + `husky` pre-commit.

## 1) Data Model (Day 1–3)
Tables (Drizzle):
- **users**: id, auth_sub, profile (age, height, pregnancy status, due date), dietary prefs (vegan, allergies, dislikes), region, units.
- **pregnancies**: id, user_id, conception_date, trimester (derived), outcomes.
- **intake_entries**: id, user_id, date_time, food_id (nullable), free_text, qty, unit, source (`barcode|ocr|ai|manual`).
- **intake_nutrients**: entry_id, nutrient_id, amount (SI), confidence.
- **nutrients**: id (e.g., choline, DHA, folate…), unit, display_name, weekly/daily flag.
- **targets**: user_id or default, trimester, nutrient_id, min, max, weekly_min (if applicable).
- **measurements**: user_id, date, weight, waist, hip, other circumferences, photo_refs.
- **photos**: id, user_id, date, uri, meta.
- **nudges**: id, user_id, date, nutrient_id, gap_size, suggestion_text, action_taken.
- **foods**: id, brand, name, barcode, source (`USDA|OpenFoodFacts|custom`).
- **food_nutrients**: food_id, nutrient_id, amount_per_100g.

Indices: users(auth_sub), foods(barcode), intake_entries(user_id,date_time), measurements(user_id,date).

## 2) Standards & Targets Layer (Day 2–4)
- Ingest **trimester targets** into `targets` from `config/nutrition_rules.yaml` (see `config/`).
- Map nutrients: Macro (kcal, protein, carbs, fat), Fiber, Choline, Vitamin A, Folate, B-complex, B12, Vitamin C, Calcium, Selenium, Iodine, DHA/EPA. (Book-derived values will be housed in config; do not hard-code in UI.)
- Implement trimester derivation: `trimester = floor(gestational_weeks/13)+1`.

## 3) Capture Pipelines (Day 4–10)
- **Barcode**: integrate OpenFoodFacts (public) first; leave stub for commercial UPC provider later.
- **Label OCR**: on-device OCR (e.g., Tesseract wasm) MVP; later: server OCR (Google Vision/AWS Textract) behind feature flag.
- **AI Describe**: prompt -> nutrient estimation service (LLM call) returning structured nutrient guesses + confidence; *never* overwrite scanned data—merge with source precedence: `barcode > ocr > ai > manual`.
- Confidence model: assign `source_weight` and show uncertainty badges in UI.

## 4) Preferences & Constraints (Day 6–8)
- User profile supports: allergies, intolerances, dislikes, diet type (omnivore/vegetarian/vegan), fish/shellfish toggles, caffeine prefs.
- Suggestion engine filters foods/recipes/supplements by constraints before proposing gaps fillers. No fish suggestions if fish is off, etc.

## 5) Nudge Engine (Day 8–12)
- Nightly job computes **daily** gaps and **weekly** gaps (e.g., choline/DHA weekly totals).
- For each nutrient gap above threshold (configurable), pick top 3 suggestions:
  - Food-based (respect prefs),
  - Supplement-based (if enabled),
  - Plant-based alternative.
- Record `nudges` and surface in UI with “accept/add” quick actions.

## 6) Visualizations (Day 8–14)
- **Daily dashboard**: rings/bars for macros, fiber, vitamins, minerals; hover → sources & confidence.
- **Weekly dashboard**: progress toward choline, DHA/EPA, B12, Vitamin D; recommend catch-up items.
- **Trends**: weight & measurements over time; photo timeline with privacy toggles.
- **Phase views**: Pre-conception, Trimester 1/2/3, Interpregnancy, Breastfeeding.

## 7) UX Flows (Day 10–15)
- **Fast add**: scan barcode → confirm qty → add.
- **Label scan**: capture → parse → review nutrient diff → accept.
- **Describe**: “I ate a bowl of oatmeal with blueberries & flax” → parsed item with uncertainty chips.
- **Gap nudge**: Tap suggestion → prefilled intake entry (portion editable) → log.

## 8) Integrations (Day 12–18)
- Food databases: OpenFoodFacts now; plan USDA FDC later.
- Photos: local file storage in dev; S3 in prod with signed URLs.
- Auth: Auth0/Supabase auth; secure JWT → server.
- Telemetry: PostHog/Amplitude events: logging, scans, accepts, dismissal reasons.

## 9) Safety, Compliance, and Claims (Day 5–on)
- Prominent **disclaimer**: Not medical advice; not a medical device; consult clinician if flagged symptoms.
- Content safety: avoid prescriptive medical dosing; provide ranges and references.

## 10) Testing (continuous)
- Unit: parsers, nutrient math, trimester calc, targets mapping.
- Integration: barcode → entry → nudge surfaces.
- Snapshot tests for charts.
- Seed scripts for demo accounts.

## 11) Releases & Flags
- Feature flags: OCR, AI Describe, Supplements, USDA sync.
- Beta cohort with feedback capture.

## Milestones
- **M1 (Core logging + daily/weekly views)**: Intake + dashboards + prefs + basic nudges.
- **M2 (Capture breadth)**: Barcode + OCR + AI Describe stabilized.
- **M3 (Phase-aware coaching)**: Trimester/breastfeeding programs, refined suggestions.
- **M4 (Polish + perf)**: Animations, caching, offline cues, app hardening.
