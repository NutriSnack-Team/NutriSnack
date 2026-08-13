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
      case 'child': return { img: 'child.png', cardBorder: 'border-yellow-400', titleColor: 'text-yellow-600', ring: 'ring-yellow-400', imgBg: 'bg-[#fffdf2]' };
      case 'teen': return { img: 'teen.png', cardBorder: 'border-pink-300', titleColor: 'text-pink-500', ring: 'ring-pink-300', imgBg: 'bg-[#fff5f8]' };
      case 'adult': return { img: 'adult.png', cardBorder: 'border-blue-300', titleColor: 'text-blue-600', ring: 'ring-blue-300', imgBg: 'bg-[#f4f8ff]' };
      case 'elderly': return { img: 'elderly.png', cardBorder: 'border-green-400', titleColor: 'text-green-700', ring: 'ring-green-400', imgBg: 'bg-[#f4fcf6]' };
      default: return { img: 'child.png', cardBorder: 'border-gray-300', titleColor: 'text-gray-700', ring: 'ring-gray-300', imgBg: 'bg-gray-50' };
    }
  };

  const theme = getAvatarTheme(ageGroup);
  
  const pillTextColor = color;
  const pillBorderColor = color.replace('text-', 'border-');

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[20px] flex flex-col text-center shadow-sm relative overflow-hidden cursor-pointer transition-all duration-200 
        ${isSelected ? `ring-2 ${theme.ring} ring-offset-2 border-2 ${theme.cardBorder}` : `border border-gray-200 hover:border-gray-300 hover:shadow-md`} h-full`}
    >
      {/* Top area with title, subtitle, and image */}
      <div className={`flex flex-col w-full relative ${theme.imgBg}`}>
        <div className="pt-3 pb-1 z-10">
          <h4 className={`font-bold text-lg leading-tight mt-1 mb-0.5 ${theme.titleColor}`}>{ageGroup}</h4>
          <p className={`text-[10px] font-medium ${theme.titleColor} opacity-60 mb-0`}>{ageRange}</p>
        </div>
        
        {/* Image Container */}
        <div className="relative h-35 w-full flex items-center justify-center">
          <img src={`/${theme.img}`} alt={ageGroup} className="absolute inset-0 w-full h-full object-cover mix-blend-multiply" />
          
          {/* Score Badge */}
          <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center shadow-sm border-[3px] ${theme.cardBorder} z-20`}>
            <span className={`text-3xl font-extrabold leading-none ${theme.titleColor}`}>{score}</span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Recommendation Pill */}
      <div className="bg-white pt-8 pb-4 px-3 w-full flex items-center justify-center shrink-0 z-10">
        <div className={`w-full py-1.5 rounded-full border ${pillBorderColor} flex items-center justify-center`}>
          <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${pillTextColor} leading-none`}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
