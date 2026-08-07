import { Factory, FlaskConical, Flame, Leaf } from 'lucide-react';

interface ScoreBreakdownProps {
  product: any;
  scoreData: any;
}

export function ScoreBreakdown({ product, scoreData }: ScoreBreakdownProps) {
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

  // Helper for dynamic pill and progress color
  const getPill = (valStr: string, maxStr: string) => {
    const score = parseFloat(valStr);
    const max = parseFloat(maxStr);
    const ratio = max > 0 ? score / max : 0;
    if (ratio >= 0.8) return { bg: 'bg-green-50 text-green-700', progress: 'bg-[#00a85a]', text: 'HIGH' };
    if (ratio >= 0.4) return { bg: 'bg-orange-50 text-orange-600', progress: 'bg-orange-500', text: 'NEUTRAL' };
    return { bg: 'bg-red-50 text-[#d32f2f]', progress: 'bg-[#d32f2f]', text: 'LOW' };
  };

  const sections = [
    { 
      id: 'Nutrition', title: 'Nutrition Pillar', weight: `${(wN * 100).toFixed(0)}%`, 
      score: valN, max: (wN * 100).toFixed(1), icon: Flame, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', 
      desc: product.nutrition.sugar > 15 || product.nutrition.sodium > 400 ? 'High in saturated fat, sugar, and sodium.' : 'Balanced nutritional profile.' 
    },
    { 
      id: 'Ingredients', title: 'Ingredients Pillar', weight: `${(wI * 100).toFixed(0)}%`, 
      score: valI, max: (wI * 100).toFixed(1), icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', 
      desc: comp.I > 80 ? 'High quality ingredients.' : 'Some refined ingredients and added sugar.' 
    },
    { 
      id: 'Processing', title: 'Processing Pillar', weight: `${(wP * 100).toFixed(0)}%`, 
      score: valP, max: (wP * 100).toFixed(1), icon: Factory, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', 
      desc: product.nova > 3 ? 'Ultra-processed level.' : 'Moderate processing level.' 
    },
    { 
      id: 'Additives', title: 'Additives Pillar', weight: `${(wA * 100).toFixed(0)}%`, 
      score: valA, max: (wA * 100).toFixed(1), icon: FlaskConical, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', 
      desc: comp.A && comp.A > 80 ? 'No harmful additives.' : 'Contains permissible additives in moderate amounts.' 
    }
  ];

  const overallGrade = scoreData.ageWise?.child?.grade || scoreData.overallGrade || "C-"; // Fallback to C- if missing

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
        <div>
          <h3 className="font-bold text-gray-900 text-xl">
            Detailed Score Breakdown
          </h3>
          <p className="text-sm text-gray-500 mt-1">How this product's NutriGuard Score is calculated</p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Final Score</span>
              <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full">Grade {overallGrade}</span>
           </div>
           
           <div className="relative w-16 h-16 rounded-full border-4 border-orange-100 flex items-center justify-center">
              <div className="absolute top-0 right-0 w-full h-full rounded-full border-4 border-orange-500 border-t-transparent border-l-transparent rotate-45"></div>
              <div className="flex flex-col items-center z-10">
                 <span className="text-2xl font-bold text-orange-600 leading-none">{scoreData.overall}</span>
                 <span className="text-[9px] text-gray-500 font-bold mt-0.5">/ 100</span>
              </div>
           </div>
        </div>
      </div>

      {/* Grid of 4 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {sections.map(sec => {
          const pill = getPill(sec.score, sec.max);
          const ratio = (parseFloat(sec.score) / parseFloat(sec.max)) * 100;

          return (
            <div key={sec.id} className="border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col h-full bg-white">
              <div className="flex items-start gap-3 mb-6">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${sec.bg} ${sec.color}`}>
                   <sec.icon className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900 text-sm">{sec.title}</h4>
                    <span className="text-[11px] text-gray-500 font-medium">Weight: {sec.weight}</span>
                 </div>
              </div>

              <div className="mt-auto">
                 <div className="flex items-baseline justify-end gap-1 mb-2">
                    <span className="text-xl font-bold text-gray-900">{sec.score}</span>
                    <span className="text-sm font-medium text-gray-400">/ {sec.max}</span>
                 </div>

                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full ${pill.progress}`} style={{ width: `${ratio}%` }}></div>
                 </div>

                 <div className="flex flex-col items-start gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${pill.bg}`}>
                      {pill.text}
                    </span>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {sec.desc}
                    </p>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer structural penalty */}
      <div className="flex flex-col md:flex-row gap-6">
         <div className="flex-1 bg-purple-50/50 border border-purple-100 rounded-xl p-5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
               <span className="text-[10px] font-bold text-purple-700 tracking-widest">NOVA</span>
            </div>
            <div className="flex-1">
               <h4 className="font-bold text-purple-900 text-sm">Structural NOVA Penalty</h4>
               <p className="text-xs text-purple-700/70 mt-1">Applied to raw score based on processing level.</p>
            </div>
            <div className="bg-white/60 px-4 py-2 rounded-lg border border-purple-50 flex flex-col items-center">
               <span className="text-[10px] text-purple-500 font-medium mb-0.5">Processing Level</span>
               <span className="font-bold text-purple-900 text-sm">{product.nova === 1 ? 'Unprocessed' : product.nova === 2 ? 'Culinary Ing.' : product.nova === 3 ? 'Processed' : 'Ultra Processed'}</span>
            </div>
            <div className="bg-purple-100/50 px-4 py-2 rounded-lg border border-purple-100 flex flex-col items-center">
               <span className="text-[10px] text-purple-600 font-medium mb-0.5">Penalty Applied</span>
               <span className="font-bold text-purple-900 text-sm">x{product.nova === 1 ? '1.0' : product.nova === 2 ? '0.9' : product.nova === 3 ? '0.7' : '0.5'}</span>
            </div>
         </div>

         <div className="md:w-1/3 bg-gray-50/80 border border-gray-100 rounded-xl p-5 flex flex-col justify-center">
            <h4 className="font-bold text-gray-900 text-sm mb-1.5">How it works</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              The final score is the sum of all pillars after applying the NOVA structural penalty to reflect overall processing impact.
            </p>
         </div>
      </div>

    </div>
  );
}
