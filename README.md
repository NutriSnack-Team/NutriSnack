# NutriGuard 🛡️

NutriGuard is an advanced, transparent nutritional scoring engine designed to evaluate Indian retail packaged foods. Moving beyond simple traffic-light systems, NutriGuard dynamically calculates a 0–100 score (Grades A to E) based on a rigorous 4-pillar algorithmic framework that adapts to different age groups.

## 🌟 Core Features

- **Dynamic Scoring Engine:** Calculates scores on-the-fly without relying on hardcoded values.
- **Age-Banded Evaluation:** Generates unique nutritional grades based on reference intakes for Child, Teen, Adult, and Elderly profiles (using ICMR-NIN 2020 thresholds).
- **NOVA Classification Penalty:** Strictly integrates the NOVA framework to mathematically penalize ultra-processed foods (NOVA 4), ensuring they cannot achieve a "healthy" score regardless of synthetic fortification.
- **Transparent Equation Builder:** Breaks down exactly how a product scored across its 4 pillars (Nutrition, Ingredients, Processing, Additives).
- **Responsive Premium UI:** Built with React and Tailwind CSS for a fluid, app-like experience.

## 🧮 The V1 Scoring Framework

The score is calculated via the Master Formula:
NGS_raw = (0.35 * N) + (0.20 * I) + (0.15 * P) + (0.30 * A)
Final Score = NGS_raw * NOVA_Scale_Multiplier

1. **N (Nutrition):** Evaluates negative nutrients (Sugar, Sodium, Saturated Fats) against positive nutrients (Protein, Fiber) using standard deviation decay.
2. **I (Ingredients):** Rewards the presence of whole foods (water, millets, nuts) while penalizing refined flours and added sugars.
3. **P (Processing):** Penalizes category-specific processing methods (e.g., Ready-to-Eat) while fully exempting NOVA 1 natural staples.
4. **A (Additives):** Scans for E-numbers and maps them against health-risk thresholds.

## 🚀 Tech Stack

- **Frontend:** React 18, Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **PWA Support:** vite-plugin-pwa (Offline Mode)
- **Database:** Local JSON (100 mapped retail products)

## 📦 Local Setup

1. **Clone the repository:**
   git clone https://github.com/yourusername/nutriguard.git
   cd nutriguard

2. **Install dependencies:**
   npm install

3. **Run the development server:**
   npm run dev

4. Open your browser and navigate to http://localhost:5173

## 📁 Project Structure

- `src/components/` - Reusable UI components (Product Cards, Score Tables).
- `src/data/` - Static JSON databases (`products.json`, `ingredients.json`, `additives.json`).
- `src/utils/` - The core algorithmic engine (`scoreCalculator.ts`).
- `src/pages/` - React Router views (Scan, Products, etc.).
- `public/` - High-quality graphical assets mapped to the product database.

### Core Configuration Files
- `index.html` - The absolute entry point of the PWA application.
- `package.json` - Defines all dependencies and terminal scripts.
- `vite.config.ts` - The build tool configuration (handles hot-reloading and PWA manifest).
- `tsconfig.json` - Strict TypeScript compiler rules.
- `oxlintrc.json` - Linter configuration for maintaining code quality.

## 📝 License
MIT License
