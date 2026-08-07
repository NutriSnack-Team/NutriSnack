import { calculateNutriGuardScore } from './scoreCalculator';

const gradeToNumber = (grade: string) => {
  const map: Record<string, number> = {
    'E': 0, 'D': 1, 'D+': 2, 'C-': 3, 'C': 4, 'C+': 5, 'B': 6, 'B+': 7, 'A': 8, 'A+': 9
  };
  return map[grade] || -1;
};

export const getManufacturerCounterfactual = (product: any, ageGroup: 'child'|'teen'|'adult'|'elderly'): string | null => {
  const originalBreakdown = calculateNutriGuardScore(product);
  const originalGradeStr = originalBreakdown.ageWise[ageGroup].grade;
  const originalGradeNum = gradeToNumber(originalGradeStr);
  
  if (originalGradeNum >= 9) return null; // Already A+, can't improve
  if (originalBreakdown.flags?.includes('mandatory_nutrient_undeclared')) return null;

  let testProduct = JSON.parse(JSON.stringify(product));
  
  // To avoid infinite loops or linear approximations, we try up to 20 reduction steps of 5% each (up to 100% reduction).
  // At each step, we identify the dominant nutrient and reduce it.
  // Note: if the dominant nutrient shifts, we reduce the NEW dominant nutrient.
  
  // Track total reduction per nutrient to formulate the final statement.
  let reductions: Record<string, number> = {};

  for (let step = 1; step <= 20; step++) {
    let currentBreakdown = calculateNutriGuardScore(testProduct);
    let currentGrade = currentBreakdown.ageWise[ageGroup].grade;
    let currentGradeNum = gradeToNumber(currentGrade);
    
    if (currentGradeNum > originalGradeNum) {
      // Improved! Build statement
      let statements = [];
      for (const [nut, pct] of Object.entries(reductions)) {
         statements.push(`${nut} by ${Math.round(pct * 100)}%`);
      }
      return `Manufacturer Action: Reduce ${statements.join(' and ')} to reach a ${currentGrade} grade.`;
    }
    
    let worstKey = currentBreakdown.ageWise[ageGroup].dominantNutrient?.key;
    if (!worstKey) break;

    // Reduce the worst nutrient in the test product by 5% of its ORIGINAL value, or 5% of its CURRENT value?
    // Let's reduce by 5% of its original value.
    if (!reductions[worstKey]) reductions[worstKey] = 0;
    reductions[worstKey] += 0.05;
    
    let originalVal = product.nutrition[worstKey] !== undefined ? product.nutrition[worstKey] : (worstKey === 'totalSugar' ? product.nutrition.sugar : (worstKey === 'addedSugar' ? product.nutrition.addedSugar : 0));
    
    let newVal = Math.max(0, originalVal * (1 - reductions[worstKey]));
    if (testProduct.nutrition[worstKey] !== undefined) {
      testProduct.nutrition[worstKey] = newVal;
    } else if (worstKey === 'totalSugar' && testProduct.nutrition.sugar !== undefined) {
      testProduct.nutrition.sugar = newVal;
    } else if (worstKey === 'addedSugar' && testProduct.nutrition.addedSugar !== undefined) {
      testProduct.nutrition.addedSugar = newVal;
    }
    
    // Also, if totalSugar is reduced, we should cap addedSugar to totalSugar
    if (worstKey === 'totalSugar') {
       let addedOrig = product.nutrition.addedSugar !== undefined ? product.nutrition.addedSugar : product.nutrition.addedSugars;
       if (addedOrig && addedOrig > newVal) {
           if (testProduct.nutrition.addedSugar !== undefined) testProduct.nutrition.addedSugar = newVal;
           if (testProduct.nutrition.addedSugars !== undefined) testProduct.nutrition.addedSugars = newVal;
       }
    }
  }
  
  return `Manufacturer Action: Requires extensive multi-nutrient reformulation to improve grade.`;
};

export const getConsumerAlternative = (product: any, ageGroup: 'child'|'teen'|'adult'|'elderly', allProducts: any[]): any | null => {
  const originalBreakdown = calculateNutriGuardScore(product);
  const originalGradeNum = gradeToNumber(originalBreakdown.ageWise[ageGroup].grade);
  
  if (originalGradeNum >= 9) return null; // Already A+
  
  // Paper Section IV-N constraint: category + indulgence tier + calorie range + flavor profile
  const originalCalories = product.nutrition?.calories || 0;
  
  let candidates = allProducts.filter(p => {
    if (p.id === product.id) return false;
    if (p.category !== product.category) return false;
    
    // Exact match on indulgence tier and flavor profile
    if (p.indulgence_tier !== product.indulgence_tier) return false;
    if (p.flavor_profile !== product.flavor_profile) return false;
    
    let pCals = p.nutrition?.calories || 0;
    if (originalCalories > 0) {
      let ratio = pCals / originalCalories;
      if (ratio < 0.8 || ratio > 1.2) return false;
    }
    
    let pBreakdown = calculateNutriGuardScore(p);
    let pGradeNum = gradeToNumber(pBreakdown.ageWise[ageGroup].grade);
    
    return pGradeNum > originalGradeNum;
  });
  
  if (candidates.length === 0) return null;
  
  // Sort by highest grade, then highest score
  candidates.sort((a, b) => {
    let aB = calculateNutriGuardScore(a).ageWise[ageGroup];
    let bB = calculateNutriGuardScore(b).ageWise[ageGroup];
    if (gradeToNumber(aB.grade) !== gradeToNumber(bB.grade)) {
      return gradeToNumber(bB.grade) - gradeToNumber(aB.grade);
    }
    return bB.score - aB.score;
  });
  
  return candidates[0];
};
