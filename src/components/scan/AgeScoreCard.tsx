interface AgeScoreCardProps {
  ageGroup: string;
  ageRange: string;
  score: number;
  label: string;
  color: string;
  bg: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function AgeScoreCard({ ageGroup, ageRange, score, label, color, isSelected, onClick }: AgeScoreCardProps) {
  const getAvatarTheme = (group: string) => {
    switch (group.toLowerCase()) {
      case 'child': return { img: 'child.png', cardBorder: 'border-yellow-400', titleColor: 'text-yellow-600', ring: 'ring-yellow-400', cardBg: 'bg-yellow-50' };
      case 'teen': return { img: 'teen.png', cardBorder: 'border-pink-300', titleColor: 'text-pink-600', ring: 'ring-pink-300', cardBg: 'bg-pink-50' };
      case 'adult': return { img: 'adult.png', cardBorder: 'border-blue-300', titleColor: 'text-blue-700', ring: 'ring-blue-300', cardBg: 'bg-blue-50' };
      case 'elderly': return { img: 'elderly.png', cardBorder: 'border-green-300', titleColor: 'text-green-700', ring: 'ring-green-300', cardBg: 'bg-green-50' };
      default: return { img: 'child.png', cardBorder: 'border-gray-300', titleColor: 'text-gray-700', ring: 'ring-gray-300', cardBg: 'bg-gray-50' };
    }
  };

  const theme = getAvatarTheme(ageGroup);
  
  // Convert text-red-600 to border-red-200 and text-red-600
  const colorName = color.replace('text-', '').split('-')[0]; // e.g. red
  const pillBorder = `border-${colorName}-200`;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border-2 flex flex-col text-center p-3 shadow-sm relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? theme.ring + ' ring-2 ring-offset-2' : ''} ${theme.cardBorder} h-full`}
    >
      {/* Title */}
      <h4 className={`font-bold text-xl mb-0.5 ${theme.titleColor}`}>{ageGroup}</h4>
      <p className={`text-[11px] font-medium ${theme.titleColor} opacity-70 mb-1`}>{ageRange}</p>

      {/* Image Container */}
      <div className="relative flex-1 w-[calc(100%+1.5rem)] -mx-3 mt-1 mb-8 flex items-center justify-center min-h-[140px]">
        <img src={`/${theme.img}`} alt={ageGroup} className="absolute inset-0 w-full h-full object-cover mix-blend-multiply" />
        
        {/* Score Badge */}
        <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 w-[72px] h-[72px] bg-white rounded-full flex flex-col items-center justify-center shadow-sm border-4 ${theme.cardBorder} z-10`}>
          <span className={`text-3xl font-extrabold leading-none ${theme.titleColor}`}>{score}</span>
        </div>
      </div>

      {/* Recommendation Pill */}
      <div className={`mt-auto px-2 py-1.5 rounded-full border ${pillBorder} bg-white shadow-sm w-full z-20 flex flex-col items-center justify-center`}>
        <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wide ${color} flex flex-col leading-tight`}>
          {label.split(' ').map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </span>
      </div>
    </div>
  );
}
