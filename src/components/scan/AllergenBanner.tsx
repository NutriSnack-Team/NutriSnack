import { AlertTriangle, ChevronRight } from 'lucide-react';

interface AllergenBannerProps {
  allergens?: string[];
  flags?: string[];
}

export function AllergenBanner({ allergens, flags }: AllergenBannerProps) {
  const isUndeclared = flags?.includes('allergen_undeclared');

  if (isUndeclared) {
    return (
      <div className="w-full bg-red-50/80 border border-red-200 rounded-xl px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center shadow-sm">
        <div className="flex items-center space-x-3 mb-3 sm:mb-0">
          <div className="bg-red-500 rounded-md p-1.5 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-red-800 tracking-wide text-sm">ALLERGEN INFO UNDECLARED</span>
        </div>
        
        <div className="hidden sm:block w-px h-6 bg-red-200 mx-4"></div>
        
        <div className="flex items-center flex-1">
          <span className="text-sm text-gray-700 font-medium">This product is missing a clear allergen declaration.</span>
        </div>
      </div>
    );
  }

  if (!allergens || allergens.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-orange-50/80 border border-orange-200 rounded-xl px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center shadow-sm">
      <div className="flex items-center space-x-3 mb-3 sm:mb-0">
        <div className="bg-orange-500 rounded-md p-1.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-orange-800 tracking-wide text-sm">ALLERGEN ALERT</span>
      </div>
      
      <div className="hidden sm:block w-px h-6 bg-orange-200 mx-4"></div>
      
      <div className="flex items-center space-x-2 flex-wrap flex-1 gap-y-2">
        <span className="text-sm text-gray-700 font-medium mr-1">This product contains:</span>
        {allergens.map((allergen, idx) => (
          <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
            {allergen}
          </span>
        ))}
      </div>
    </div>
  );
}
