import { Info, AlertTriangle, CheckCircle2, Factory, FlaskConical, Flame, Leaf, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ScoreBreakdownProps {
  product: any;
  scoreData: any;
}

export function ScoreBreakdown({ product, scoreData }: ScoreBreakdownProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('Nutrition');

  const comp = scoreData.components;
  const isProv = comp.A === null;
  const wN = isProv ? 0.41 : 0.35;
  const wI = isProv ? 0.24 : 0.20;
  const wP = isProv ? 0.35 : 0.15;
  const wA = isProv ? 0 : 0.30;
  
  const valN = (comp.N * wN).toFixed(1);
  const valI = (comp.I * wI).toFixed(1);
  const valP = (comp.P * wP).toFixed(1);
  const valA = isProv ? '0.0' : (comp.A! * wA).toFixed(1);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // --- Dynamic Reasons Generation ---
  
  const getNutritionReasons = () => {
    const reasons = [];
    const nut = product.nutrition;
    if (nut.sodium > 400) reasons.push({ type: 'warn', text: `High Sodium (${nut.sodium}mg)` });
    if (nut.sugar > 15) reasons.push({ type: 'warn', text: `High Added Sugar (${nut.sugar}g)` });
    if (nut.saturatedFat > 5) reasons.push({ type: 'warn', text: `High Saturated Fat (${nut.saturatedFat}g)` });
    if (nut.calories > 400) reasons.push({ type: 'warn', text: `Calorie Dense (${nut.calories}kcal)` });
    
    if (nut.protein > 8) reasons.push({ type: 'good', text: `Good Source of Protein (${nut.protein}g)` });
    if (nut.fiber > 5) reasons.push({ type: 'good', text: `High Fiber (${nut.fiber}g)` });
    
    if (reasons.length === 0) reasons.push({ type: 'neutral', text: 'Balanced nutritional profile.' });
    return reasons;
  };

  const getIngredientReasons = () => {
    const reasons = [];
    if (scoreData.flags?.includes('sugar_split')) {
      reasons.push({ type: 'warn', text: 'Sugar Splitting Detected (-10 pts penalty)' });
    }
    if (product.ingredients && product.ingredients.length > 15) {
      reasons.push({ type: 'warn', text: `Complex ingredient list (${product.ingredients.length} items)` });
    }
    if (comp.I > 80) reasons.push({ type: 'good', text: 'High quality whole-food ingredients.' });
    else if (comp.I < 40) reasons.push({ type: 'warn', text: 'Contains refined or poor quality ingredients.' });
    
    if (reasons.length === 0) reasons.push({ type: 'neutral', text: 'Standard ingredients used.' });
    return reasons;
  };

  const getProcessingReasons = () => {
    const reasons = [];
    const n = product.nova;
    if (n === 4) reasons.push({ type: 'warn', text: 'Ultra-Processed Food (Severe NOVA Penalty)' });
    else if (n === 3) reasons.push({ type: 'warn', text: 'Processed Food (Moderate NOVA Penalty)' });
    else if (n === 2) reasons.push({ type: 'neutral', text: 'Processed Culinary Ingredient' });
    else if (n === 1) reasons.push({ type: 'good', text: 'Unprocessed or Minimally Processed (No Penalty)' });
    return reasons;
  };

  const getAdditiveReasons = () => {
    const reasons = [];
    if (isProv) {
      reasons.push({ type: 'neutral', text: 'No additive data available. Score re-weighted.' });
      return reasons;
    }
    const adds = product.additives || [];
    if (adds.length > 5) reasons.push({ type: 'warn', text: `High number of additives (${adds.length})` });
    else if (adds.length === 0) reasons.push({ type: 'good', text: 'No artificial additives detected.' });
    
    if (comp.A !== null && comp.A < 50) reasons.push({ type: 'warn', text: 'High-risk or controversial E-numbers detected.' });
    
    if (reasons.length === 0) reasons.push({ type: 'neutral', text: 'Additives are within safe limits.' });
    return reasons;
  };

  const sections = [
    { id: 'Nutrition', title: 'Nutrition Pillar', weight: `${(wN * 100).toFixed(0)}%`, score: valN, max: (wN * 100).toFixed(1), icon: Flame, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', reasons: getNutritionReasons() },
    { id: 'Ingredients', title: 'Ingredients Pillar', weight: `${(wI * 100).toFixed(0)}%`, score: valI, max: (wI * 100).toFixed(1), icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', reasons: getIngredientReasons() },
    { id: 'Processing', title: 'Processing Pillar', weight: `${(wP * 100).toFixed(0)}%`, score: valP, max: (wP * 100).toFixed(1), icon: Factory, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', reasons: getProcessingReasons() },
    { id: 'Additives', title: 'Additives Pillar', weight: `${(wA * 100).toFixed(0)}%`, score: valA, max: (wA * 100).toFixed(1), icon: FlaskConical, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', reasons: getAdditiveReasons() }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
            Detailed Score Breakdown
          </h3>
          <p className="text-sm text-gray-500 mt-1">Discover exactly why this product received its final grade.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 leading-none">{scoreData.overall}</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Final Score</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map(sec => (
          <div key={sec.id} className={`border rounded-xl overflow-hidden transition-all duration-200 ${expandedSection === sec.id ? 'ring-2 ring-gray-100 border-transparent shadow-sm' : 'border-gray-200'}`}>
            <button 
              onClick={() => toggleSection(sec.id)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${sec.bg} ${sec.color}`}>
                  <sec.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900">{sec.title}</h4>
                  <span className="text-xs text-gray-500 font-medium">Weight: {sec.weight}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-gray-900">{sec.score} <span className="text-gray-400 font-normal text-sm">/ {sec.max}</span></div>
                </div>
                {expandedSection === sec.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </button>
            
            {expandedSection === sec.id && (
              <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-100">
                <div className="pt-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Factors</p>
                  <div className="flex flex-col gap-2">
                    {sec.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        {r.type === 'warn' && <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />}
                        {r.type === 'good' && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
                        {r.type === 'neutral' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                        <span className={`text-sm ${r.type === 'warn' ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                          {r.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Structural Penalty */}
      <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
               <span className="text-[8px] font-bold text-indigo-700 tracking-widest">NOVA</span>
            </div>
            <div>
               <h4 className="font-bold text-indigo-900 text-sm">Structural NOVA Penalty</h4>
               <p className="text-xs text-indigo-700 mt-0.5">Applied to raw score based on processing level.</p>
            </div>
         </div>
         <div className="text-right">
            <div className="font-bold text-indigo-900 text-lg">x{product.nova === 1 ? '1.0' : product.nova === 2 ? '0.9' : product.nova === 3 ? '0.7' : '0.5'}</div>
         </div>
      </div>

    </div>
  );
}
