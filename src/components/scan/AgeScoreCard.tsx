interface AgeScoreCardProps {
  ageGroup: string;
  ageRange: string;
  score: number;
  label: string;
  color: string;
  bg: string;
}

export function AgeScoreCard({ ageGroup, ageRange, score, label, color }: AgeScoreCardProps) {
  const getAvatarTheme = (group: string) => {
    switch (group.toLowerCase()) {
      case 'child': return { img: 'child.png', cardBg: 'bg-yellow-50', cardBorder: 'border-yellow-200', titleColor: 'text-yellow-700' };
      case 'teen': return { img: 'teen.png', cardBg: 'bg-pink-50', cardBorder: 'border-pink-200', titleColor: 'text-pink-700' };
      case 'adult': return { img: 'adult.png', cardBg: 'bg-blue-50', cardBorder: 'border-blue-200', titleColor: 'text-blue-700' };
      case 'elderly': return { img: 'elderly.png', cardBg: 'bg-green-50', cardBorder: 'border-green-200', titleColor: 'text-green-700' };
      default: return { img: 'child.png', cardBg: 'bg-gray-50', cardBorder: 'border-gray-200', titleColor: 'text-gray-700' };
    }
  };

  const theme = getAvatarTheme(ageGroup);

  return (
    <div className={`rounded-2xl border flex flex-col justify-between text-center ${theme.cardBg} ${theme.cardBorder} shadow-sm relative overflow-hidden min-h-[180px]`}>
      
      {/* Background image (completely visible) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center pt-8 pb-12">
        <img src={`/${theme.img}`} alt="" className="w-full h-full object-contain" />
      </div>

      {/* Layers for text readability */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/95 to-transparent z-0"></div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/95 to-transparent z-0"></div>

      {/* Top Border Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 z-20 ${color.replace('text-', 'bg-')}`}></div>
      
      {/* Title (Top) */}
      <div className="relative z-10 pt-4 px-4 flex flex-col items-center">
        <h4 className={`font-semibold mb-0.5 ${theme.titleColor}`}>{ageGroup}</h4>
        <p className={`text-[10px] font-medium ${theme.titleColor} opacity-80`}>{ageRange}</p>
      </div>

      <div className="flex-1"></div>

      {/* Score (Bottom) */}
      <div className="relative z-10 pb-4 px-4 flex flex-col items-center">
        <div className={`w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center mb-2 border-2 ${theme.cardBorder}`}>
          <span className={`text-2xl font-bold leading-none ${theme.titleColor}`}>{score}</span>
        </div>
        
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${color} bg-white shadow-sm ring-1 ring-gray-100/50`}>
          {label}
        </span>
      </div>
    </div>
  );
}
