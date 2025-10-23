# PRD — VeggieFresh Pregnancy Nutrition

## 1. Problem
Pregnant and TTC women need actionable, phase-aware nutrition tracking with minimal friction. Existing trackers are generic, lack trimester/breastfeeding programs, and often ignore user constraints (allergies, vegetarian/vegan, fish dislike). Result: inconsistent intake, micronutrient gaps, and stress.

## 2. Product Vision
“Macrofactor-level flexibility” for pregnancy + interpregnancy + breastfeeding: powerful logging and clear, compassionate coaching that respects constraints and avoids food-policing.

## 3. Goals & Non-Goals
### Goals
- Fast, reliable logging via barcode, label OCR, and “describe my meal.”
- Phase-aware dashboards: daily macros/fiber/micros; weekly choline + DHA/EPA + B12 + Vit D, etc.
- Nudges that **only** suggest feasible options (respecting diet, allergies, dislikes).
- Progress views: weight/measurements/photos; trends and deltas.
- Config-driven nutrient targets sourced from *Real Food for Pregnancy* (and other citations).

### Non-Goals
- Not a medical device; no diagnoses or prescriptive medical dosing.
- No calorie coaching for weight loss during pregnancy; focus is adequacy and balance.
- No social features in v1.

## 4. Personas
1. **Planner (TTC/Pre-conception)**: wants readiness check and habit scaffolding.
2. **Pregnant (T1/T2/T3)**: experiencing aversions and nausea; wants “good enough” targets and gap-filling ideas that aren’t gross right now.
3. **Postpartum/Breastfeeding**: wants adequacy and convenience, with weekly catch-up recommendations.

## 5. Key User Stories
- As a pregnant user, I can scan a barcode to log food in <5 seconds.
- As a vegan, I never see meat/fish suggestions and do see plant or supplement alternatives for DHA/choline.
- As a user with avocado nausea, I can mark “avoid avocado” and never see it in suggestions.
- As a user, I can see if I’m on track for weekly DHA/choline.
- As a user, I can accept a nudge and have a pre-filled item added instantly.

## 6. Features & Requirements
### 6.1 Intake
- **Barcode** lookup (OpenFoodFacts MVP; pluggable providers).
- **Label OCR** with review/diff screen; confidence tags.
- **AI Describe** returns structured item(s) with macro/micro estimates & uncertainty.
- Merge policy: `barcode > ocr > ai > manual`; record provenance.

### 6.2 Nutrient Model
- Nutrient catalog includes: macros (kcal, protein, carbs, fat), fiber, choline, vitamin A, folate, vitamin C, B-complex, B12, calcium, selenium, iodine, DHA/EPA.
- Per-phase targets loaded from `config/nutrition_rules.yaml`; daily and weekly evaluators.
- Trimester computed from due date or last period; phases: Pre-conception, T1–T3, Interpregnancy, Breastfeeding.

### 6.3 Suggestions / Nudges
- Nightly job computes gaps; thresholds configurable.
- Suggestions prioritized: 1) food options, 2) plant alternatives, 3) supplements (if user enables).
- Respect user constraints before generating candidates.
- UX: “Add now” (1 tap), “Swap” (cycle suggestion), “Dismiss” (learns preference).

### 6.4 Dashboards & Viz
- **Daily**: macro/fiber/micro rings/bars with confidence overlays and sources tooltip.
- **Weekly**: choline, DHA/EPA, B12, Vit D progress; “catch-up” block.
- **Trends**: weight, measurements, photos (with secure storage).

### 6.5 Preferences
- Diet type, allergies, dislikes, avoidants, supplement-allowed toggle.
- “Never suggest” list.
- Regionalization (units, food DB source).

### 6.6 Data & Integrations
- Food sources: OpenFoodFacts (MVP), USDA FDC (planned).
- Storage: Postgres (prod) or SQLite (dev) via Drizzle; S3 for photos.
- Auth: OAuth (Auth0/Supabase).
- Telemetry: PostHog or Amplitude.

### 6.7 Safety & Legal
- Prominent disclaimer; link to references.
- Avoid exceeding ULs in supplement suggestions; cap via rules file.
- PII/PHI: minimize collection, encrypt at rest; no selling data; granular export/delete.

## 7. KPIs / Success Metrics
- D1/D7 logging retention.
- % entries from fast paths (barcode/OCR/AI).
- % days on/over 80% of phase targets; weekly adequacy for choline & DHA/EPA.
- Nudge acceptance rate; nudge dismissal reasons.
- Time-to-log median < 7 seconds for barcode flow.

## 8. System Architecture (current repo alignment)
- **Client**: Vite + React + Tailwind; chart lib (Recharts/Victory). :contentReference[oaicite:2]{index=2}
- **Server**: Node + TypeScript; `server/index.ts` entrypoint. :contentReference[oaicite:3]{index=3}
- **ORM**: Drizzle (`drizzle.config.ts`). :contentReference[oaicite:4]{index=4}
- **Shared**: Type-safe models in `shared/` for DTOs & nutrient enums. :contentReference[oaicite:5]{index=5}

## 9. Milestones (v1)
- **M1**: Intake (manual + barcode), daily/weekly dashboards, prefs, rules-driven targets.
- **M2**: Label OCR + AI Describe; suggestion engine GA.
- **M3**: Phase programs (pre-conception/T1–T3/IPP/BF), trend views + photos.
- **M4**: Perf, offline-friendly cues, visual polish.

## 10. Risks
- OCR quality variance → mitigate with review/diff and feedback loop.
- AI misestimation → conservative defaults; highlight uncertainty; require human confirm.
- Data source gaps (regional barcodes) → allow custom foods; caching and fallback.

## 11. Open Questions
- Which commercial barcode DB to add after MVP?
- Clinician review panel needed for claim vetting?
- Region-based target variants?
