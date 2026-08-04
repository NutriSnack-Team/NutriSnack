

interface AlternativeProduct {
  id: number;
  name: string;
  brand: string;
  image: string;
  score: number;
  grade: string;
  category?: string;
  nutrition?: any;
}

export function ComparisonCard({ alt, rank = 1 }: { alt: AlternativeProduct; rank?: number }) {
  const getGradeColor = (g: string) => {
    if (g.includes('A') || g.includes('B')) return 'text-green-600';
    if (g.includes('C')) return 'text-yellow-500';
    return 'text-red-600';
  };
  
  const getGradeBorder = (g: string) => {
    if (g.includes('A') || g.includes('B')) return 'stroke-green-500';
    if (g.includes('C')) return 'stroke-yellow-400';
    return 'stroke-red-500';
  };
  
  const getChoicePill = (g: string) => {
    if (g.includes('A') || g.includes('B')) return { text: 'Better Choice', bg: 'bg-green-50 text-green-600' };
    if (g.includes('C')) return { text: 'Moderate Choice', bg: 'bg-yellow-50 text-yellow-600' };
    return { text: 'Poor Choice', bg: 'bg-red-50 text-red-600' };
  };

  const getRankStyle = (r: number) => {
    switch (r) {
      case 1: return 'bg-green-600';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const choice = getChoicePill(alt.grade);
  const strokeClass = getGradeBorder(alt.grade);
  
  return (
    <div className="flex flex-col relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all h-full overflow-hidden">
      
      {/* Rank Badge */}
      <div className={`absolute top-0 left-0 w-8 h-8 rounded-br-2xl flex items-center justify-center text-white font-bold text-[13px] z-10 ${getRankStyle(rank)}`}>
        {rank}
      </div>

      {/* Image Area */}
      <div className="w-full h-[150px] flex items-center justify-center p-3 mt-7 relative">
        {alt.image ? (
          <img src={`/${alt.image}`} alt={alt.name} className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm" />
        ) : (
          <span className="text-[10px] text-gray-400">No Image</span>
        )}
      </div>
      
      {/* Title & Brand */}
      <div className="px-2 pt-2 text-center h-12 flex flex-col justify-start mt-1">
        <h4 className="font-bold text-[13px] text-gray-900 leading-tight mb-0.5 line-clamp-2 px-1">{alt.name}</h4>
        <p className="text-[10px] text-gray-500 font-medium">{alt.brand} • {alt.category || 'Food'}</p>
      </div>
      
      {/* Score & Grade */}
      <div className="flex items-center justify-center gap-4 mt-1 px-3">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" className="stroke-gray-100" strokeWidth="3" />
            <circle cx="28" cy="28" r="24" fill="none" className={strokeClass} strokeWidth="3" strokeDasharray={`${(alt.score / 100) * 150.8} 150.8`} />
          </svg>
          <div className="flex flex-col items-center relative top-0.5">
             <span className="text-xl font-bold text-gray-900 leading-none mb-0.5 tracking-tight">{alt.score}</span>
             <span className="text-[8px] text-gray-500 font-medium leading-none">/100</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center bg-[#f7fdf9] rounded-lg px-3 py-1.5 min-w-[50px] border border-green-50/50">
          <span className={`text-[17px] font-bold leading-none mb-1 ${getGradeColor(alt.grade)}`}>{alt.grade}</span>
          <span className="text-[7px] font-bold text-gray-500 tracking-widest text-center">HEALTH<br/>GRADE</span>
        </div>
      </div>
      
      {/* Choice Pill */}
      <div className="flex justify-center mt-2.5 mb-3">
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${choice.bg}`}>
          {choice.text}
        </span>
      </div>
    </div>
  );
}
