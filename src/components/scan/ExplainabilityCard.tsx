import { Sparkles, ShieldCheck, Target, AlertTriangle, Scale, Quote, Shield } from 'lucide-react';
import citationsData from '@/data/citations.json';
import { getManufacturerCounterfactual } from '@/utils/counterfactual';
import productsData from '@/data/products.json';

interface ExplainabilityCardProps {
  product: any;
  breakdown: any;
  ageGroup: 'child' | 'teen' | 'adult' | 'elderly';
}

export function ExplainabilityCard({ product, breakdown, ageGroup }: ExplainabilityCardProps) {
  const domNutrient = breakdown.ageWise[ageGroup].dominantNutrient;
  const grade = breakdown.ageWise[ageGroup].grade;
  const recommendation = breakdown.ageWise[ageGroup].label;
  const score = breakdown.ageWise[ageGroup].score;
  const flags = breakdown.flags || [];

  if (!domNutrient) return null;

  // 1. Fetch Citation
  const citationDict = citationsData as Record<string, Record<string, string>>;
  const nutrientCitationBlock = citationDict[domNutrient.key];
  const citation = nutrientCitationBlock ? (nutrientCitationBlock[ageGroup] || nutrientCitationBlock['default']) : "General health recommendation: Balance macro and micro nutrient intake.";

  // 2. Fetch Counterfactuals
  const mfrCounterfactual = getManufacturerCounterfactual(product, ageGroup);

  // Formatting helper
  const formatKey = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
             <Sparkles className="w-6 h-6" />
           </div>
           <div>
              <h3 className="text-xl font-bold text-gray-900">AI Explanation & Evidence</h3>
              <p className="text-sm text-gray-500 mt-1">Science-backed insights and recommendations</p>
           </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold border border-purple-100">
          <ShieldCheck className="w-4 h-4" /> Evidence Based
        </div>
      </div>
  
      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
         {/* Left Column */}
         <div className="flex flex-col gap-8 lg:border-r border-gray-100 lg:pr-8">
            
            {/* Recommendation */}
            <div className="flex gap-4">
               <div className="mt-1 w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
               </div>
               <div>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                     <h4 className="font-bold text-gray-900 text-base">Recommendation</h4>
                     <span className="px-3 py-1 bg-orange-50 text-orange-700 text-[11px] font-bold rounded-full border border-orange-100">
                       {recommendation} (Grade {grade}, Score {score})
                     </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                     This product is best consumed {recommendation.toLowerCase()} in small portions.
                  </p>
               </div>
            </div>
  
            {/* Key Driver */}
            <div className="flex gap-4">
               <div className="mt-1 w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 text-base mb-1">Key Driver</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                     The primary negative factor is <span className="font-semibold text-red-500">{formatKey(domNutrient.key)}</span>, which reaches <span className="font-bold text-red-500">{domNutrient.dv}%</span> of the daily limit for a {ageGroup}.
                  </p>
               </div>
            </div>
  
            {/* Serving Reality Check */}
            {breakdown.ageWise[ageGroup].serving_reality_check && (
            <div className="flex gap-4">
               <div className="mt-1 w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 text-base mb-1">Serving Reality Check</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                     While scored per 100g, a typical serving ({product.serving_size}) actually exposes a {ageGroup} to <span className="font-bold text-orange-500">{breakdown.ageWise[ageGroup].serving_reality_check}%</span> of their daily limit.
                     {flags.includes('amplified_exposure_category') && <span className="block mt-1"><strong className="text-orange-500">Caution:</strong> Liquid/large-portion categories often amplify intake.</span>}
                  </p>
               </div>
            </div>
            )}
         </div>
  
         {/* Right Column */}
         <div className="flex flex-col gap-6">
            
            {/* WHO Guideline */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 relative overflow-hidden">
               <Quote className="w-8 h-8 text-blue-200 absolute top-4 left-4" />
               <div className="relative z-10 pl-10">
                  <h4 className="font-bold text-blue-800 text-sm mb-2">WHO Draft Guideline:</h4>
                  <p className="text-blue-900/80 italic text-sm leading-relaxed mb-4">
                    '{citation}'
                  </p>
                  <p className="text-xs text-blue-400">Source: WHO Draft Guidelines on Diet and Physical Activity, 2023</p>
               </div>
            </div>
  
            {/* Manufacturer Action */}
            {mfrCounterfactual && (
            <div className="bg-green-50/50 border border-green-100 rounded-xl p-5 flex gap-4">
               <Shield className="w-6 h-6 text-green-600 shrink-0 mt-1" />
               <div>
                  <h4 className="font-bold text-green-800 text-sm mb-1">Manufacturer Action</h4>
                  <p className="text-green-700 text-sm leading-relaxed">
                    {mfrCounterfactual}
                  </p>
               </div>
            </div>
            )}
         </div>
      </div>
    </div>
  );
}
