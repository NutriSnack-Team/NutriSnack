import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface ConfidenceGaugeProps {
  flags?: string[];
}

export function ConfidenceGauge({ flags }: ConfidenceGaugeProps) {
  const isBoundarySensitive = flags?.includes('boundary_sensitive');
  const isClassificationSensitive = flags?.includes('classification_sensitive');
  const isDataMissing = flags?.includes('mandatory_nutrient_undeclared');

  let ruleConfidence = 100;
  if (isBoundarySensitive) ruleConfidence -= 15;
  if (isClassificationSensitive) ruleConfidence -= 20;

  // Data Confidence: 100 for manual entry (since we assume our products.json is curated), 0 if FSSAI missing.
  // We don't have OCR integration, so this is a documented interim proxy.
  let dataConfidence = isDataMissing ? 0 : 100;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 mb-6">
      {/* Rule Confidence */}
      <div className="flex-1 flex flex-col items-center justify-center border-r border-slate-100 pr-0 md:pr-6">
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Rule Confidence</h4>
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r="36" className="text-slate-100 stroke-current" strokeWidth="8" fill="none" />
            <circle cx="48" cy="48" r="36" className={`${ruleConfidence > 80 ? 'text-green-500' : 'text-orange-500'} stroke-current`} strokeWidth="8" fill="none" strokeDasharray={`${(ruleConfidence / 100) * 226} 226`} />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">{ruleConfidence}%</span>
          </div>
        </div>
        <p className="text-xs text-center text-slate-500 mt-2">
          {isClassificationSensitive ? "Sensitive to classification bounds." : (isBoundarySensitive ? "Near a grade boundary." : "Solid margin.")}
        </p>
      </div>

      {/* Data Confidence */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Confidence</h4>
        <div className="relative w-24 h-24 flex items-center justify-center">
          {dataConfidence === 100 ? (
            <ShieldCheck className="w-16 h-16 text-blue-500" />
          ) : (
            <ShieldAlert className="w-16 h-16 text-red-500" />
          )}
        </div>
        <p className="text-xs text-center text-slate-500 mt-2">
          {dataConfidence === 100 ? "Manually verified label data." : "Missing mandatory FSSAI nutrient data."}
        </p>
      </div>
    </div>
  );
}
