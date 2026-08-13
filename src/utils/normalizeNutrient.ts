// src/utils/normalizeNutrient.ts
//
// Single source of truth for reading a nutrient value off a product object.
// The OCR schema (geminiService.ts) emits `totalSugars` / `addedSugars` (plural),
// while some hand-entered catalogue data uses `sugar` / `addedSugar` (singular).
// Every place in the codebase that reads a nutrient value should go through
// this function instead of ad hoc `a || b || 0` fallbacks, so the aliasing
// logic can't drift out of sync between files again.

export type NutrientKey =
  | 'calories' | 'protein' | 'fiber' | 'totalSugar' | 'addedSugar'
  | 'sodium' | 'saturatedFat' | 'transFat' | 'cholesterol' | 'caffeine' | 'fat' | 'calcium';

// Maps each canonical key to every field name it might appear under in raw data.
const FIELD_ALIASES: Record<NutrientKey, string[]> = {
  calories: ['calories', 'energy'],
  protein: ['protein'],
  fiber: ['fiber', 'fibre'],
  totalSugar: ['totalSugars', 'totalSugar', 'sugar', 'sugars'],
  addedSugar: ['addedSugars', 'addedSugar'],
  sodium: ['sodium'],
  fat: ['fat', 'totalFat'],
  saturatedFat: ['saturatedFat'],
  transFat: ['transFat'],
  cholesterol: ['cholesterol'],
  caffeine: ['caffeine'],
  calcium: ['calcium'],
};

/**
 * Returns the raw declared value for a nutrient, or undefined if the label
 * never declared it at all (distinct from 0, which means "declared as zero").
 */
export function getDeclaredNutrient(nutrition: Record<string, any> | undefined, key: NutrientKey): number | undefined {
  if (!nutrition) return undefined;
  for (const field of FIELD_ALIASES[key]) {
    if (nutrition[field] !== undefined && nutrition[field] !== null) {
      return Number(nutrition[field]);
    }
  }
  return undefined;
}

/** Same as getDeclaredNutrient, but defaults to 0 for scoring math where "undeclared → treat as 0" is already the intended behavior. */
export function getNutrient(nutrition: Record<string, any> | undefined, key: NutrientKey): number {
  return getDeclaredNutrient(nutrition, key) ?? 0;
}

/** Writes a value back using whichever alias the object already uses, or the canonical name if none is present yet. Used by counterfactual.ts when it mutates a cloned product. */
export function setNutrient(nutrition: Record<string, any>, key: NutrientKey, value: number): void {
  for (const field of FIELD_ALIASES[key]) {
    if (nutrition[field] !== undefined) {
      nutrition[field] = value;
      return;
    }
  }
  nutrition[FIELD_ALIASES[key][0]] = value;
}
