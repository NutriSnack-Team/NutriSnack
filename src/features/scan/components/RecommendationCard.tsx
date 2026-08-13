import { ChevronRight } from 'lucide-react';

interface RecommendationAction {
  text: string;
  impact: string;
  impactColor: string;
  description: string;
}

interface RecommendationCardProps {
  actions: RecommendationAction[];
  potentialScore: number;
  potentialGrade: string;
}

export function RecommendationCard({ actions, potentialScore, potentialGrade }: RecommendationCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="p-1 bg-teal-100 text-teal-600 rounded">
            {/* Using a simple SVG for now */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          </span>
          Manufacturer Recommendations
        </h3>
       
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="space-y-3 mb-6">
          {actions.map((action, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-gray-900">{action.text}</p>
                {action.description && <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${action.impactColor}`}>{action.impact}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-orange-50 rounded-xl p-4 flex items-center justify-between border border-orange-100/50 mt-auto">
          <div>
            <p className="text-xs text-orange-800/70 font-medium uppercase tracking-wider mb-1">Potential New Score</p>
            <div className="flex items-end gap-1 text-orange-600">
              <span className="text-3xl font-bold leading-none">{potentialScore}</span>
              <span className="text-sm font-medium mb-0.5">/10</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-orange-800/70 font-medium uppercase tracking-wider mb-1">Grade</p>
            <span className="text-2xl font-bold text-orange-500">{potentialGrade}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
