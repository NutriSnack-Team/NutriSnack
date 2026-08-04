import { type LucideIcon } from 'lucide-react';

interface NutritionCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  color: string;
}

export function NutritionCard({ icon: Icon, label, value, unit, color }: NutritionCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className={`p-3 rounded-lg bg-gray-50 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">
          {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
        </p>
      </div>
    </div>
  );
}
