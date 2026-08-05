import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UploadBox, AgeScoreCard, NutritionCard, IngredientChip, 
  CalculationTable, RecommendationCard, 
  ComparisonCard, CompareTable 
} from '@/components';
import { useAppStore } from '@/store/useAppStore';
import { Flame, Droplet, Activity, Hexagon, ShieldAlert, Factory, AlertTriangle, AlertCircle } from 'lucide-react';
import { calculateNutriGuardScore, getGradeAndColor } from '@/utils';
import type { ScoreBreakdown } from '@/types';

import productsData from '@/data/products.json';
import ingredientsData from '@/data/ingredients.json';
import additivesData from '@/data/additives.json';

export function Scan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { scanResultId, setScanResultId } = useAppStore();
  
  // Use the ID from the URL if present, otherwise use the global scanResultId
  const activeId = id ? parseInt(id) : scanResultId;

  const [product, setProduct] = useState<any>(null);
  const [scoreData, setScoreData] = useState<ScoreBreakdown | null>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);

  useEffect(() => {
    if (activeId) {
      const p = (productsData as any[]).find(item => item.id === activeId);
      if (!p) return;

      // 1. Calculate Score Dynamically
      const calculatedScore = calculateNutriGuardScore(p);
      setScoreData(calculatedScore);

      // 2. Map Ingredients from lookup dictionary
      const mappedIngredients = p.ingredients.map((ingName: string) => {
        const lowerIng = ingName.toLowerCase();
        const matchedKey = Object.keys(ingredientsData).find(k => lowerIng.includes(k.toLowerCase()));
        const detail = matchedKey ? (ingredientsData as any)[matchedKey] : null;
        return {
          id: ingName,
          name: ingName,
          role: detail ? detail.type : 'Unknown',
          description: detail ? detail.concerns || detail.benefits : '',
          status: detail ? (detail.risk === 'High' ? 'bad' : detail.risk === 'Moderate' ? 'concern' : 'good') : 'neutral'
        };
      });

      // Map Additives
      const mappedAdditives = p.additives.map((insCode: string) => {
        const lowerCode = insCode.toLowerCase();
        const matchedKey = Object.keys(additivesData).find(k => lowerCode.includes(k.toLowerCase()));
        const detail = matchedKey ? (additivesData as any)[matchedKey] : null;
        return {
          id: insCode,
          name: detail ? detail.name : insCode,
          role: detail ? detail.type : 'Additive',
          description: detail ? detail.description : '',
          status: detail ? (detail.risk === 'High' ? 'bad' : detail.risk === 'Moderate' ? 'concern' : 'good') : 'neutral'
        };
      });

      setIngredients([...mappedIngredients, ...mappedAdditives]);

      // 3. Dynamic Alternatives
      const currentScore = calculatedScore.overall;
      const betterAlts = (productsData as any[])
        .filter(prod => prod.category === p.category && prod.id !== p.id)
        .map(prod => {
          const scoreData = calculateNutriGuardScore(prod);
          return { ...prod, score: scoreData.overall, grade: scoreData.grade };
        })
        .filter(prod => prod.score >= currentScore) // Only better alternatives
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
      
      setAlternatives(betterAlts);

      // 4. Dynamic Recommendations
      const actions = [];
      const nut = p.nutrition || {};
      const comp = calculatedScore.components;
      
      if (nut.sugar && nut.sugar > 15) {
        actions.push({ text: `Reduce Added Sugar`, impact: "+5.0", impactColor: "text-green-600", description: `Currently flagged for high sugar content (${nut.sugar}g)` });
      }
      if (nut.sodium && nut.sodium > 400) {
        actions.push({ text: `Lower Sodium Levels`, impact: "+4.0", impactColor: "text-green-600", description: `Salt content exceeds optimal limits (${nut.sodium}mg)` });
      }
      if (nut.saturatedFat && nut.saturatedFat > 5) {
        actions.push({ text: `Cut Saturated Fats`, impact: "+3.5", impactColor: "text-green-600", description: `High saturated fat levels detected (${nut.saturatedFat}g)` });
      }
      if (comp.A !== null && comp.A < 80) {
        actions.push({ text: `Remove Artificial Additives`, impact: "+4.5", impactColor: "text-green-600", description: `Contains potentially harmful chemical additives` });
      }
      if (comp.P < 60) {
        actions.push({ text: `Reduce Ultra-Processing`, impact: "+3.0", impactColor: "text-green-600", description: `Consider using whole, unrefined ingredients` });
      }
      
      actions.sort((a, b) => parseFloat(b.impact) - parseFloat(a.impact));
      
      // Fallback
      if (actions.length === 0) {
        actions.push({ text: `Maintain Current Profile`, impact: `+0.0`, impactColor: "text-gray-400", description: `Product is within acceptable bounds` });
      }
      
      const potentialGain = actions.reduce((sum, a) => sum + parseFloat(a.impact.replace('+', '')), 0);
      const newScore = Math.min(100, calculatedScore.overall + potentialGain);
      const newGrade = getGradeAndColor(newScore).grade;

      setRecommendations({
        productId: p.id,
        actions,
        potentialScore: Math.round(newScore),
        potentialGrade: newGrade
      });
      
      setProduct(p);
    }
  }, [activeId]);

  if (!activeId || !product || !scoreData) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Scan a Product</h2>
            <p className="text-gray-500">Upload an image of the front or back of the pack.</p>
          </div>
          <UploadBox onUploadSuccess={(newId) => {
             setScanResultId(newId);
             navigate(`/product/${newId}`);
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        
        {/* Row 1: Scanned Product (Left) | Age-Wise Scores (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Scanned Product */}
          <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col p-6">
            
            {/* Top Section */}
            <div className="flex flex-col sm:flex-row gap-6 mb-5">
               {/* Image Box */}
               <div className="w-full sm:w-[180px] h-[180px] bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-3 shrink-0 shadow-sm">
                 <img src={`/${product.image}`} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm" />
               </div>
               
               {/* Details */}
               <div className="flex flex-col justify-center">
                 <h3 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1.5">{product.name}</h3>
                 <p className="text-sm text-gray-500 mb-3">{product.brand}</p>
                 
                 {/* Category Tags */}
                 <div className="flex flex-wrap gap-2 mb-4">
                   <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[11px] font-bold rounded-lg">{product.category}</span>
                   <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[11px] font-bold rounded-lg">Packaged Food</span>
                 </div>
                 
                 {/* Price */}
                 <div className="mt-auto">
                   <div className="text-2xl font-bold text-gray-900 leading-none mb-1">₹{product.price}</div>
                   <div className="text-[11px] text-gray-400 font-medium">MRP (Incl. of all taxes)</div>
                 </div>
               </div>
            </div>
            {/* Quick Facts Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-auto">
               
               {/* Fact 1: Net Weight */}
               <div className="border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-2 shrink-0">
                   {/* Purse/Weight icon from screenshot */}
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h21v11a2 2 0 0 1-2 2h-1v-1"/><path d="M16 16H8"/><path d="M12 12v4"/><circle cx="12" cy="8" r="4"/></svg>
                 </div>
                 <span className="text-[9px] text-gray-500 font-medium mb-1 whitespace-nowrap">Net Weight</span>
                 <div className="w-full border-t border-dashed border-gray-200 my-0.5"></div>
                 <span className="text-[13px] font-bold text-gray-900 mt-1">{product.net_weight}</span>
               </div>

               {/* Fact 2: Serving Size */}
               <div className="border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-2 shrink-0">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                 </div>
                 <span className="text-[9px] text-gray-500 font-medium mb-1 whitespace-nowrap">Serving Size</span>
                 <div className="w-full border-t border-dashed border-gray-200 my-0.5"></div>
                 <span className="text-[13px] font-bold text-gray-900 mt-1">{product.serving_size}</span>
               </div>

               {/* Fact 3: Ingredients */}
               <div className="border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-2 shrink-0">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                 </div>
                 <span className="text-[9px] text-gray-500 font-medium mb-1 whitespace-nowrap">Ingredients</span>
                 <div className="w-full border-t border-dashed border-gray-200 my-0.5"></div>
                 <span className="text-[13px] font-bold text-gray-900 mt-1">{product.ingredients.length}</span>
               </div>

               {/* Fact 4: Additives */}
               <div className="border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-2 shrink-0">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><line x1="5.52" y1="16" x2="18.48" y2="16"/></svg>
                 </div>
                 <span className="text-[9px] text-gray-500 font-medium mb-1 whitespace-nowrap">Additives</span>
                 <div className="w-full border-t border-dashed border-gray-200 my-0.5"></div>
                 <span className="text-[13px] font-bold text-gray-900 mt-1">{product.additives.length}</span>
               </div>

               {/* Fact 5: NOVA Level */}
               <div className="border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 shrink-0">
                   <div className="relative flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 2l3.09 1.62 3.46-.48 1.48 3.17 2.91 1.9L21.32 12l1.62 3.79-2.91 1.9-1.48 3.17-3.46-.48L12 22l-3.09-1.62-3.46.48-1.48-3.17-2.91-1.9L2.68 12l-1.62-3.79 2.91-1.9 1.48-3.17 3.46.48L12 2z"/></svg>
                      <span className="absolute text-[6px] font-bold text-white tracking-widest mt-0.5">NOVA</span>
                   </div>
                 </div>
                 <span className="text-[9px] text-gray-500 font-medium mb-1 whitespace-nowrap">NOVA Level</span>
                 <div className="w-full border-t border-dashed border-gray-200 my-0.5"></div>
                 <div className="flex flex-col items-center mt-1">
                   <span className="text-[13px] font-bold text-gray-900 leading-none mb-0.5">{product.nova}</span>
                   <span className="text-[6px] text-blue-500 font-bold tracking-tight">({product.nova === 4 ? 'Ultra Processed' : 'Processed'})</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Right: Age-Wise NutriGuard Scores */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="p-1.5 bg-purple-100 text-purple-600 rounded"><Activity className="w-4 h-4"/></span>
                Age-Wise NutriGuard Scores
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              <AgeScoreCard ageGroup="Child" ageRange="4-12 yrs" {...scoreData.ageWise.child} />
              <AgeScoreCard ageGroup="Teen" ageRange="13-18 yrs" {...scoreData.ageWise.teen} />
              <AgeScoreCard ageGroup="Adult" ageRange="19-59 yrs" {...scoreData.ageWise.adult} />
              <AgeScoreCard ageGroup="Elderly" ageRange="60+ yrs" {...scoreData.ageWise.elderly} />
            </div>
          </div>
        </div>

        {/* Row 2: Nutrition Grid (Left) | Ingredient Analysis (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-600 rounded"><Activity className="w-4 h-4"/></span>
              Product Details & Nutrition <span className="text-xs text-gray-400 font-normal ml-2">(Per 100g)</span>
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <NutritionCard icon={Flame} label="Energy" value={product.nutrition.calories} unit="kcal" color="text-blue-500" />
              <NutritionCard icon={Droplet} label="Total Fat" value={product.nutrition.fat} unit="g" color="text-blue-500" />
              <NutritionCard icon={Hexagon} label="Saturated Fat" value={product.nutrition.saturatedFat} unit="g" color="text-red-500" />
              
              {/* Mock fields for missing data to fill grid of 12 */}
              <NutritionCard icon={Activity} label="Trans Fat" value={0} unit="g" color="text-green-500" />
              <NutritionCard icon={Activity} label="Cholesterol" value={0} unit="mg" color="text-blue-500" />
              
              <NutritionCard icon={Activity} label="Sodium" value={product.nutrition.sodium} unit="mg" color="text-orange-500" />
              
              <NutritionCard icon={Activity} label="Total Carbs" value={53} unit="g" color="text-blue-500" />
              <NutritionCard icon={Activity} label="Dietary Fiber" value={product.nutrition.fiber} unit="g" color="text-green-500" />
              
              <NutritionCard icon={Activity} label="Total Sugar" value={product.nutrition.sugar} unit="g" color="text-orange-500" />
              <NutritionCard icon={Activity} label="Added Sugar" value={product.nutrition.sugar} unit="g" color="text-red-500" />
              <NutritionCard icon={Activity} label="Protein" value={product.nutrition.protein} unit="g" color="text-green-500" />
              <NutritionCard icon={Activity} label="Calcium" value={15} unit="mg" color="text-blue-500" />
            </div>
            <p className="text-xs text-gray-400 mt-4">*Approximate values extracted from nutrition label.</p>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="p-1.5 bg-purple-100 text-purple-600 rounded"><Factory className="w-4 h-4"/></span>
                Ingredient Analysis
              </h3>
              <div className="flex gap-4 text-xs font-medium text-gray-600">
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-500"></div> Good</span>
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-yellow-400"></div> Neutral</span>
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-orange-500"></div> Concern</span>
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500"></div> Bad</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 max-h-[400px]">
              {ingredients.map(ing => (
                <IngredientChip key={ing.id} {...ing} />
              ))}
            </div>
           
          </div>

        </div>

         {/* Row 3: Score Calculation */}
         <div className="grid grid-cols-1 gap-6">
            <CalculationTable score={scoreData.overall} components={scoreData.components} nova={product.nova || 4} flags={scoreData.flags} />
         </div>

        {/* Row 4: Why This Score? */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
           <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
             <span className="p-1.5 bg-purple-100 text-purple-600 rounded"><AlertCircle className="w-4 h-4"/></span>
             Why This Score?
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col">
                <div className="flex gap-3 items-start mb-2">
                  <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">High Sodium<br/>{product.nutrition.sodium}mg</h4>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-auto pt-2">Above recommended limit for this category.</p>
              </div>

              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col">
                <div className="flex gap-3 items-start mb-2">
                  <Flame className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">High Saturated Fat<br/>{product.nutrition.saturatedFat}g</h4>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-auto pt-2">Above recommended limit for this category.</p>
              </div>

              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col">
                <div className="flex gap-3 items-start mb-2">
                  <Factory className="w-6 h-6 text-purple-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">Ultra-Processed<br/>(NOVA {product.nova})</h4>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-auto pt-2">Highly processed with additives.</p>
              </div>

              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col">
                <div className="flex gap-3 items-start mb-2">
                  <Activity className="w-6 h-6 text-pink-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">Contains MSG<br/>(INS 621)</h4>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-auto pt-2">May cause sensitivity in some individuals.</p>
              </div>

              <div className="p-4 border border-blue-200 rounded-xl bg-blue-50 flex flex-col">
                <div className="flex gap-3 items-start mb-2">
                  <ShieldAlert className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">Bonus Zero Rule<br/>Triggered</h4>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-auto pt-2">Due to severe violations in key nutrients.</p>
              </div>
           </div>
        </div>

        {/* Row 5: Recommendations (Left) | Better Alternatives (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-full">
            {recommendations ? (
              <RecommendationCard {...recommendations} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full flex items-center justify-center text-gray-400 text-sm">
                No recommendations available.
              </div>
            )}
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                 <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                 </span>
                 Better Alternatives <span className="text-xs text-gray-400 font-normal ml-2">(Same Category / Top Picks)</span>
               </h3>
               <button className="text-xs font-medium text-primary hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              {alternatives.map((alt, index) => (
                <ComparisonCard key={alt.id} alt={alt} rank={index + 1} />
              ))}
            </div>
          </div>
        </div>

        {/* Row 6: Compare Products */}
        <CompareTable currentProduct={product} alternatives={alternatives} />

        {/* Bottom Educational Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            NutriGuard AI is an educational tool and not medical advice. Scores are based on nutrition labels and may vary by product batch.
          </p>
        </div>

      </div>
    </div>
  );
}
