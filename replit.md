# Veggie-Fresh Maternal Nutrition App

## Overview

Veggie-Fresh is a maternal nutrition tracking application designed for pregnant and breastfeeding users. The app enables users to log meals and track daily nutrient intake against recommended goals, with a focus on key nutrients like iron, vitamin C, calcium, folate, and protein. The interface features a warm, modern design system built around a custom "Carrot Tops + Beetroot" color palette with an herb-tinted background, avoiding medical coldness while maintaining credibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript as the primary UI framework
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight React Router alternative)
- Mobile-first responsive design approach

**UI Component System**
- Radix UI primitives for accessible, unstyled base components
- shadcn/ui component library with custom "Veggie-Fresh" theming
- Tailwind CSS for utility-first styling with extensive custom theme tokens
- Custom component variants including `VeggieButton`, `NutrientBadge`, and `NutrientProgress`

**Design System Implementation**
- Custom color palette with semantic tokens:
  - Primary (Carrot): `#E77C1F` - for primary CTAs
  - Secondary (Lettuce): `#6FBF4A` - for secondary actions
  - Tertiary (Beetroot): `#8E2043` - for iron-related nutrients
  - Background (Herb Tint): `#F7FBF7` - for calm, airy feel
  - Deep text: `#183A2E` - for high-contrast readability
- Typography system using Lora (serif) for headings and Source Sans 3 for body text
- Light elevation model preferring borders over shadows
- Hover and active state elevations using subtle background overlays

**State Management**
- TanStack Query (React Query) for server state management
- Form state managed via React Hook Form with Zod validation
- Toast notifications for user feedback

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the REST API
- ESM module system throughout the codebase
- Custom middleware for request logging and JSON body parsing

**API Design**
- RESTful endpoints for meal CRUD operations:
  - `GET /api/meals` - Retrieve all meals
  - `POST /api/meals` - Create a new meal
  - `DELETE /api/meals/:id` - Delete a meal by ID
- Dedicated endpoints for nutrient calculations:
  - `GET /api/nutrients/daily` - Get daily nutrient totals
  - `GET /api/goals/daily` - Get daily nutrient goals
- Zod schema validation on all incoming requests with user-friendly error messages via `zod-validation-error`

**Storage Layer**
- Abstracted storage interface (`IStorage`) for flexibility
- In-memory implementation (`MemStorage`) for development/testing
- Drizzle ORM configured for PostgreSQL with schema defined in shared directory
- Database schema includes:
  - `users` table with UUID primary keys and unique usernames
  - `meals` table tracking meal metadata and six key nutrients (calories, protein, iron, vitamin C, calcium, folate)

**Development Environment**
- Vite middleware integration for HMR in development
- Replit-specific plugins for runtime error overlay, cartographer, and dev banner
- TypeScript path aliases for clean imports (`@/`, `@shared/`, `@assets/`)

### Data Models

**Meal Schema**
- Core fields: id, name, mealType (breakfast/lunch/dinner/snack), timestamp
- Nutrient fields: calories (integer), protein, iron, vitaminC, calcium, folate (all real/float)
- Validation ensures non-negative values and required meal names

**User Schema**
- Basic authentication fields: id, username, password
- Unique username constraint for user identification

**Computed Types**
- `DailyNutrients` - Aggregated nutrient totals for a given date
- `DailyGoals` - Target nutrient values for pregnant/breastfeeding users

### Build & Deployment

**Build Process**
- Client build: Vite bundles React app to `dist/public`
- Server build: esbuild bundles Express server to `dist/index.js` with external packages
- Single output directory structure for unified deployment

**Scripts**
- `dev`: Development mode with tsx for hot-reloading
- `build`: Production build for both client and server
- `start`: Production server execution
- `db:push`: Drizzle schema synchronization to database

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL via Neon serverless driver (`@neondatabase/serverless`)
- **ORM**: Drizzle ORM for type-safe database queries with `drizzle-zod` for schema-to-validation integration
- **Session Store**: `connect-pg-simple` for PostgreSQL-backed sessions (configured but not actively used in current codebase)

### UI Component Libraries
- **Radix UI**: Complete suite of 25+ primitive components including dialogs, dropdowns, tooltips, accordions, and form controls
- **Styling**: 
  - Tailwind CSS for utility classes
  - `class-variance-authority` for component variant management
  - `tailwindcss-animate` for animation utilities

### Utility Libraries
- **Date Handling**: `date-fns` for date formatting and manipulation
- **Carousel**: `embla-carousel-react` for touch-friendly image/content carousels
- **Command Palette**: `cmdk` for keyboard-driven command interfaces
- **Icons**: `lucide-react` for consistent icon system

### Development Tools
- **TypeScript**: Strict mode enabled with modern ESNext target
- **Validation**: Zod for runtime type validation and schema generation
- **Build Tools**: Vite, esbuild, PostCSS with Autoprefixer
- **Replit Integrations**: Specialized Vite plugins for development banner, error overlay, and code mapping

### Font Resources
- **Google Fonts**: Lora (serif family) and Source Sans 3 (sans-serif family) loaded from Google Fonts CDN with italic and variable weight support