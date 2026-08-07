interface IngredientChipProps {
  name: string;
  role: string;
  description: string;
  status: 'good' | 'neutral' | 'concern' | 'bad';
}

export function IngredientChip({ name, role, description, status }: IngredientChipProps) {
  const statusConfig = {
    good: { border: 'bg-green-500', badge: 'bg-green-100 text-green-700', text: 'GOOD' },
    neutral: { border: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700', text: 'NEUTRAL' },
    concern: { border: 'bg-red-500', badge: 'bg-red-100 text-red-700', text: 'CONCERN' },
    bad: { border: 'bg-red-600', badge: 'bg-red-100 text-red-800', text: 'BAD' }
  };

  const conf = statusConfig[status];

  return (
    <div className="flex items-stretch gap-4 py-3 border-b border-gray-100 last:border-0 relative">
      <div className={`w-1 rounded-full shrink-0 ${conf.border}`}></div>
      <div className="flex-1 flex items-center justify-between">
         <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 text-sm">{name}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${conf.badge.replace('text-', 'text-opacity-70 text-')}`}>{role}</span>
            </div>
            <p className="text-xs text-gray-500">{description}</p>
         </div>
         <div className={`px-2 py-1 rounded text-[10px] font-extrabold tracking-wide uppercase ${conf.badge}`}>
            {conf.text}
         </div>
      </div>
    </div>
  );
}
