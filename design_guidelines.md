# Veggie-Fresh Design System Guidelines
**Maternal Nutrition App — UI Refresh**

## Design Philosophy
Modern, warm, and trustworthy interface for pregnant/breastfeeding users. Mobile-first approach avoiding medical coldness while maintaining credibility. Light, airy aesthetic with strategic accent usage to keep UI calm and focused.

---

## Color System

### Core Palette (Carrot Tops + Beetroot)
- **Deep Text:** #183A2E
- **Carrot (Primary CTA):** #E77C1F
- **Lettuce (Secondary):** #6FBF4A
- **Beetroot (Tertiary/Iron):** #8E2043
- **Tan (Quiet Icons/Dividers):** #B6915E (use at 30–40% opacity)
- **White (Surfaces):** #FFFFFF

### Backgrounds & Surfaces
- **App Background (Herb Tint):** #F7FBF7
- **Card/Sheet Surface:** #FFFFFF
- **Hairline Border:** #E0EAE0 (1px)
- **Progress Track:** #E6EEE6
- **Focus Outline:** 2px #183A2E

### Accent Usage Budget (Keep UI Calm)
- Carrot: 5–8% of screen pixels
- Lettuce: 8–12% of screen pixels
- Beetroot: 3–6% of screen pixels

---

## Typography

### Font Families
- **Headings/Tips/Pull-quotes:** Lora (Regular/Semibold) — serif only for headings
- **Body/Inputs/Nav/Tables/Labels:** Source Sans 3 (preferred) or Inter
- **Numbers:** Enable tabular lining figures everywhere for clean alignment

### Type Scale (Mobile)
- **H1:** 28–32px / 1.15 line-height (Lora Semibold)
- **H2:** 22–24px / 1.2 line-height (Lora Semibold)
- **H3:** 18–20px / 1.25 line-height (Lora Regular/Semibold)
- **Body:** 16–17px / 1.45 line-height (Sans Regular)
- **Caption:** 13–14px / 1.3 line-height (Sans Regular)
- **Buttons:** 16–17px (Sans Medium/Semibold)

### Letter Spacing
Body text uses default tracking. Headings may tighten −1% to −2% if wrapping too soon.

---

## Components

### Buttons (Replace ALL Grey Default Buttons)
**Shape:** 12px border-radius  
**Padding:** 10–12px vertical, 16–20px horizontal  
**States:** Hover darken ~10%, Active slight press, Disabled 40% opacity, Focus outline 2px

**Primary (Solid Carrot):**
- Background: #E77C1F, Label: #FFFFFF
- Use for main call-to-action (e.g., "Log Meal")

**Secondary (Ghost Lettuce):**
- Transparent background, 1.5px border #6FBF4A, Label: #183A2E
- Use for supportive actions (e.g., "Scan")

**Tertiary (Solid Beetroot):**
- Background: #8E2043, Label: #FFFFFF
- Use sparingly for iron/supplement emphasis (e.g., "Add Iron Supplement")

### Cards & Sheets
- Surface: #FFFFFF with 1px border #E0EAE0
- Border-radius: 12px
- No heavy shadows (≤2dp if any) — prefer borders over shadows
- Titles in Lora, body text in Source Sans 3

### Chips & Badges
- **Iron Emphasis:** Solid beetroot background + white text
- **Vitamin C/Positive:** Outlined lettuce (transparent fill, lettuce border, deep text)
- **Info Variant:** Very light beet tint background + beetroot text

### Progress Bars
- Track: #E6EEE6
- Fill: Lettuce #6FBF4A

### Tabs & Navigation
- On Herb Tint background with deep text #183A2E
- Active state uses lettuce underline or dot indicator
- Avoid full-bleed accent bars

---

## Layout & Spacing

### Vertical Rhythm
Increase spacing on lighter backgrounds (e.g., 12→16px between modules)

### Visual Separation
Prefer borders and spacing over shadows for component separation

### Corner Radii
Consistent 12px across cards, buttons, and interactive elements

---

## Accessibility (Non-Negotiable)

### Contrast Requirements
- Body text: ≥4.5:1 (prefer ≥7:1 on Herb Tint)
- Large headers: ≥3:1
- Button labels vs fill: ≥4.5:1

### Interaction Standards
- Focus visible everywhere (keyboard and screen readers)
- Color-blind resilience: carrot vs lettuce actions distinguishable by labels/icons, not color alone

---

## Reference Screens

### Home Screen
Demonstrates Herb Tint background, carrot primary buttons for meal logging, lettuce secondary buttons for scanning, card-based meal history with hairline borders, and nutrient progress bars with lettuce fill.

### Food Log Screen
Shows nutrient tracking interface with iron emphasis using beetroot chips, vitamin C indicators with lettuce outlines, Lora headings for section titles, and tabular-nums for aligned nutrient values.

---

## Key Principles

1. **No grey default buttons** — every interactive element uses the defined button system
2. **Borders over shadows** — modern, clean separation using hairlines
3. **Strategic accent usage** — follow the pixel budget to maintain visual calm
4. **Lora for emotion** — headings and tips only, never body text
5. **Tabular numbers** — all numeric displays use tabular-nums for clean alignment
6. **Warm but credible** — avoid medical coldness and kids-app energy