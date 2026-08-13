import { type LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-full mb-4 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-sm text-gray-500 text-center leading-relaxed">{description}</p>
    </div>
  );
}
