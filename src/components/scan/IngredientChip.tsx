interface IngredientChipProps {
  name: string;
  role: string;
  description: string;
  status: 'good' | 'neutral' | 'concern' | 'bad';
}

export function IngredientChip({ name, role, description, status }: IngredientChipProps) {
  const statusColors = {
    good: 'bg-green-500',
    neutral: 'bg-gray-400',
    concern: 'bg-orange-500',
    bad: 'bg-red-500'
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${statusColors[status]}`}></div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 text-sm">{name}</span>
          <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{role}</span>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}
