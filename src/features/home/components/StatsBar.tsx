import { Package, BarChart2, Users, Shield } from 'lucide-react';

export function StatsBar() {
  const stats = [
    {
      icon: <Package className="w-8 h-8 text-green-500" strokeWidth={1.5} />,
      iconBg: 'bg-green-50',
      value: '150+',
      label: 'Products',
      sublabel: 'Analyzed'
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-purple-500" strokeWidth={1.5} />,
      iconBg: 'bg-purple-50',
      value: '95%',
      label: 'Explainable',
      sublabel: 'Results'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" strokeWidth={1.5} />,
      iconBg: 'bg-blue-50',
      value: '4',
      label: 'Age Groups',
      sublabel: 'Covered'
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-500" strokeWidth={1.5} />,
      iconBg: 'bg-orange-50',
      value: '100%',
      label: 'Privacy',
      sublabel: 'Focused'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-pink-500" fill="currentColor">
          {/* Simple Map Marker as approximation for map shape */}
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      ),
      iconBg: 'bg-pink-50',
      value: 'Made for',
      label: 'India',
      sublabel: 'Indian Diet & Guidelines',
      isTextHeavy: true
    }
  ];

  return (
    <div className="relative -mt-10 z-30 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-4xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 divide-x divide-gray-100">
          {stats.map((stat, idx) => (
            <div key={idx} className={`flex items-center gap-4 ${idx !== 0 ? 'pl-8' : ''}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{stat.value}</p>
                <p className="text-[13px] font-semibold text-gray-800 leading-tight">{stat.label}</p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{stat.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
