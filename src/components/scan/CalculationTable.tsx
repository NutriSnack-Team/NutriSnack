import { Info, Plus, X, Equal } from 'lucide-react';

interface CalculationTableProps {
  score: number;
  nova: number;
  components: {
    N: number;
    I: number;
    P: number;
    A: number | null;
  };
  flags?: string[];
}

export function CalculationTable({ score, nova, components, flags = [] }: CalculationTableProps) {
  const isProv = components.A === null;
  
  // Re-normalize weights if additives are missing
  const wN = isProv ? 0.41 : 0.35;
  const wI = isProv ? 0.24 : 0.20;
  const wP = isProv ? 0.35 : 0.15;
  const wA = isProv ? 0 : 0.30;
  
  const valN = (components.N * wN).toFixed(1);
  const valI = (components.I * wI).toFixed(1);
  const valP = (components.P * wP).toFixed(1);
  const valA = isProv ? '0.0' : (components.A! * wA).toFixed(1);
  
  const rawScore = (parseFloat(valN) + parseFloat(valI) + parseFloat(valP) + parseFloat(valA)).toFixed(1);
  
  const novaScale = nova === 1 ? 1.00 : nova === 2 ? 0.90 : nova === 3 ? 0.70 : 0.50;
  
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          NutriGuard Score Calculation <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">NGSF v1</span>
        </h3>
        <button className="text-xs font-medium text-blue-600 flex items-center gap-1 hover:underline">
          <Info className="w-3 h-3" /> How it works?
        </button>
      </div>

      {/* Equation Builder */}
      <div className="flex flex-col gap-6 min-w-max">
         {/* Step 1: Raw Score */}
         <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100">
           <div className="text-sm text-gray-500 font-medium mb-4">Step 1: Base Score Calculation (Weighted Sum)</div>
           <div className="flex items-center gap-4">
             {/* N */}
             <div className="flex flex-col items-center">
               <div className="text-xs text-gray-500 mb-1">Nutrition (35%)</div>
               <div className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">{valN}</div>
             </div>
             
             <Plus className="w-4 h-4 text-gray-400" />
             
             {/* I */}
             <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">Ingredients (20%)</div>
              <div className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200 relative">
                {valI}
                {flags.includes('sugar_split') && (
                  <div className="absolute -top-3 -right-3 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-red-200" title="Sugar Splitting Penalty: -10 pts">⚠️ Sugar Split</div>
                )}
              </div>
            </div>
             
             <Plus className="w-4 h-4 text-gray-400" />
             
             {/* P */}
             <div className="flex flex-col items-center">
               <div className="text-xs text-gray-500 mb-1">Processing (15%)</div>
               <div className="px-4 py-2 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200">{valP}</div>
             </div>
             
             <Plus className="w-4 h-4 text-gray-400" />
             
             {/* A */}
             <div className="flex flex-col items-center">
               <div className="text-xs text-gray-500 mb-1">Additives (30%)</div>
               <div className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200">{valA}</div>
             </div>
             
             <Equal className="w-4 h-4 text-gray-400 mx-2" />
             
             {/* Raw */}
             <div className="flex flex-col items-center">
               <div className="text-xs text-gray-600 mb-1 font-semibold">Raw Score</div>
               <div className="px-5 py-2 bg-gray-200 text-gray-900 font-bold rounded-lg border border-gray-300">{rawScore}</div>
             </div>
           </div>
         </div>
         
         {/* Step 2: Final Score */}
         <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100">
           <div className="text-sm text-gray-500 font-medium mb-4">Step 2: Structural Penalty (NOVA Scale)</div>
           <div className="flex items-center gap-6">
             <div className="flex flex-col items-center">
               <div className="text-xs text-gray-600 mb-1 font-semibold">Raw Score</div>
               <div className="px-6 py-3 bg-gray-200 text-gray-900 font-bold rounded-xl border border-gray-300 text-xl">{rawScore}</div>
             </div>
             <X className="w-5 h-5 text-gray-400" />
             <div className="flex flex-col items-center">
               <div className="text-xs text-gray-500 mb-1">NOVA {nova} Multiplier</div>
               <div className="px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-200 text-xl">{novaScale.toFixed(2)}</div>
             </div>
             <Equal className="w-5 h-5 text-gray-400 mx-2" />
             <div className="flex flex-col items-center">
               <div className="text-xs text-indigo-600 mb-1 font-bold">Final NutriGuard Score</div>
               <div className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-md text-2xl">{score}</div>
             </div>
           </div>
         </div>
      </div>

      {isProv && (
        <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100 mt-6 text-sm text-amber-800">
          <span className="font-semibold">Provisional Score:</span> Additive coverage is too low ({"<70%"}), so it has been excluded and weights renormalized.
        </div>
      )}
    </div>
  );
}
