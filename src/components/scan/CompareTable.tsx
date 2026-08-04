import { Plus, X, Search, Share2, Download, Info, CheckCircle2, MinusCircle, XCircle, BarChart2, ShieldCheck, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import productsData from '@/data/products.json';
import { calculateNutriGuardScore, additiveRisks } from '@/utils';

interface CompareTableProps {
  currentProduct: any;
  alternatives: any[];
}

const extractQualityData = (product: any) => {
  if (!product) return null;
  const ingredients = product.ingredients || [];
  const additives = product.additives || [];
  
  let oilText = "None";
  let oilQuality = "green";
  const oilIng = ingredients.find((i: string) => i.toLowerCase().includes('oil') || i.toLowerCase().includes('fat'));
  if (oilIng) {
    oilText = oilIng;
    const lower = oilIng.toLowerCase();
    if (lower.includes('palm') || lower.includes('hydrogenated') || lower.includes('interesterified')) {
      oilQuality = 'red';
    } else {
      oilQuality = 'green';
    }
  }

  let colorsText = "None";
  let colorsQuality = "green";
  const colorIngs = ingredients.filter((i: string) => i.toLowerCase().includes('colour') || i.toLowerCase().includes('color'));
  const colorCodes: string[] = [];
  colorIngs.forEach((ing: string) => {
    const matches = ing.match(/\d{3,4}[a-z]?/gi);
    if (matches) colorCodes.push(...matches);
  });
  if (colorCodes.length > 0) {
    colorsText = `${colorCodes.length} (${colorCodes.join(', ')})`;
    colorsQuality = 'red';
  }

  let addText = "None";
  let addQuality = "green";
  let detectedCodes = new Set<string>();
  additives.forEach((add: string) => {
    let match = add.match(/\b(\d{3,4}[a-z]?)\b/i);
    if (match) detectedCodes.add(match[1].toLowerCase());
  });
  ingredients.forEach((ing: string) => {
    let matches = ing.match(/\d{3,4}[a-z]?/gi);
    if (matches) matches.forEach((m: string) => detectedCodes.add(m.toLowerCase()));
  });

  if (detectedCodes.size > 0) {
    let maxRisk = 0;
    Array.from(detectedCodes).forEach(code => {
      let risk = 2; 
      if (additiveRisks[code] !== undefined) risk = additiveRisks[code];
      else if (additiveRisks[code.replace(/[a-z]+$/i, '')] !== undefined) risk = additiveRisks[code.replace(/[a-z]+$/i, '')];
      if (risk >= maxRisk) maxRisk = risk;
    });

    let riskLabel = maxRisk >= 5 ? 'High risk' : maxRisk >= 2 ? 'Medium risk' : 'Low risk';
    addQuality = maxRisk >= 5 ? 'red' : maxRisk >= 2 ? 'orange' : 'green';
    addText = `${detectedCodes.size} ${riskLabel} additive${detectedCodes.size > 1 ? 's' : ''}\n(INS ${Array.from(detectedCodes).join(', ')})`;
  }

  const sweetIngs = ingredients.filter((i: string) => {
    const l = i.toLowerCase();
    return l.includes('sugar') || l.includes('syrup') || l.includes('dextrose') || l.includes('maltodextrin') || l.includes('sucralose') || l.includes('stevia');
  });
  let sweetText = "None";
  if (sweetIngs.length > 0) {
    sweetText = sweetIngs.map((i: string) => i.split('(')[0].trim()).join(', ');
  }
  
  const nova = product.nova || 4;
  const novaText = `${nova} (${nova === 4 ? 'Ultra-Processed' : nova === 3 ? 'Processed' : nova === 2 ? 'Culinary' : 'Unprocessed'})`;
  const riskSub = addQuality === 'red' ? 'High risk' : addQuality === 'orange' ? 'Moderate risk' : 'Low risk';
  const subtitle = `${nova === 4 ? 'Ultra-processed' : 'Processed'} • ${riskSub}`;

  return { oilText, oilQuality, colorsText, colorsQuality, addText, addQuality, sweetText, novaText, subtitle };
};

export function CompareTable({ currentProduct, alternatives }: CompareTableProps) {
  const [compareItems, setCompareItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCompareItems(alternatives.slice(0, 3));
  }, [alternatives]);

  const dynamicCompareItems = compareItems.map(item => {
    const scoreData = calculateNutriGuardScore(item);
    return { ...item, score: scoreData.overall, grade: scoreData.grade };
  });

  const paddedAlternatives = [...dynamicCompareItems];
  while(paddedAlternatives.length < 3) {
    paddedAlternatives.push(null);
  }

  const currentScoreData = calculateNutriGuardScore(currentProduct);
  const items = [
    { ...currentProduct, isCurrent: true, grade: currentScoreData.grade, score: currentScoreData.overall },
    ...paddedAlternatives
  ];

  const handleAddProduct = (product: any) => {
    const scoreData = calculateNutriGuardScore(product);
    const productWithScore = { ...product, score: scoreData.overall, grade: scoreData.grade };
    setCompareItems([...compareItems, productWithScore]);
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const handleRemoveProduct = (index: number) => {
    const newItems = [...compareItems];
    newItems.splice(index, 1);
    setCompareItems(newItems);
  };

  const getRecPill = (grade: string) => {
    if (!grade) return null;
    if (grade.startsWith('A') || grade.startsWith('B')) return { text: 'Better choice', bg: 'bg-green-100', textc: 'text-green-700' };
    if (grade.startsWith('C') || grade.startsWith('D')) return { text: 'OK choice', bg: 'bg-orange-100', textc: 'text-orange-700' };
    return { text: 'Avoid', bg: 'bg-red-100', textc: 'text-red-700' };
  };

  const getGradeColor = (g: string) => {
    if (!g) return 'bg-gray-200';
    if (g.startsWith('A') || g.startsWith('B')) return 'bg-green-500';
    if (g.startsWith('C') || g.startsWith('D')) return 'bg-orange-500';
    return 'bg-red-600'; 
  };

  const bestItem = items.filter(Boolean).reduce((prev, current) => {
    return (prev.score > current.score) ? prev : current;
  }, items[0]);

  return (
    <>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg mb-12 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
             <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">NutriGuard <span className="font-medium text-gray-400">Product Comparison</span></h2>
            <p className="text-sm text-gray-500">Compare nutrition, ingredients & quality to choose smarter.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      <div className="overflow-x-auto relative">
        <div className="min-w-[900px]">
          
          {/* Top Product Header Row */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] border-b border-gray-100 bg-white relative">
            
            {/* Legend Column */}
            <div className="p-6 pr-4 border-r border-gray-100 bg-[#fafafa]">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-4">
                How to read <Info className="w-4 h-4 text-gray-400" />
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100" /> Good / Low risk
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MinusCircle className="w-5 h-5 text-orange-400 fill-orange-100" /> Average / Moderate
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <XCircle className="w-5 h-5 text-red-500 fill-red-100" /> Poor / High risk
                </div>
              </div>
            </div>

            {/* Products Columns */}
            {items.map((item, idx) => (
              <div key={idx} className="p-6 relative border-r border-gray-100 last:border-0 flex flex-col items-center text-center">
                {item?.isCurrent && (
                   <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
                )}
                {item ? (
                  <>
                    <div className="flex items-start justify-center gap-3 mb-4 w-full relative">
                      {!item.isCurrent && (
                        <button 
                          onClick={() => handleRemoveProduct(idx - 1)}
                          className="absolute -top-3 -right-3 text-[10px] text-gray-400 hover:text-red-500 font-bold flex items-center justify-center bg-gray-50 hover:bg-red-50 rounded-full w-6 h-6 transition-colors border border-gray-200 hover:border-red-200"
                        >
                          <X className="w-3 h-3" strokeWidth={3} />
                        </button>
                      )}
                      <div className="w-16 h-20 shrink-0 flex items-center justify-center p-1">
                        {item.image ? (
                          <img src={`/${item.image}`} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm" />
                        ) : (
                          <div className="text-xs text-gray-400">No Image</div>
                        )}
                      </div>
                      <Link to={`/product/${item.id}`} className="text-left flex-1 pt-1 hover:opacity-80">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight flex items-start gap-1">
                          {idx + 1}. {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className={`w-3 h-3 rounded-sm border ${item.veg ? 'border-green-600 bg-white flex items-center justify-center' : 'border-red-600 bg-white flex items-center justify-center'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                          </span>
                        </div>
                      </Link>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="text-3xl font-extrabold text-orange-500 tracking-tighter">
                        {Math.round(item.score)}<span className="text-xl text-gray-300 font-bold tracking-normal">/100</span>
                      </div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg ${getGradeColor(item.grade)}`}>
                        {item.grade.replace('+','').replace('-','')}
                      </div>
                    </div>

                    {getRecPill(item.grade) && (
                      <div className={`px-4 py-1 rounded-full text-xs font-bold mb-2 ${getRecPill(item.grade)!.bg} ${getRecPill(item.grade)!.textc}`}>
                        {getRecPill(item.grade)!.text}
                      </div>
                    )}

                    <div className="text-[10px] text-gray-400 font-medium">
                       {extractQualityData(item)!.subtitle}
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm font-semibold">Add Product</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Macro Nutrition Header Row */}
          <div className="grid grid-cols-[1.5fr_4fr] bg-[#fdfdfd] border-b border-gray-100">
             <div className="p-3 pl-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-green-600" /> Macro Nutrition <span className="font-normal text-gray-400 normal-case">(per 100g)</span>
                </h3>
             </div>
             <div></div>
          </div>

          {/* Macro Rows */}
          {[
            { label: 'Energy', unit: '(kcal)', icon: '🔥', key: 'calories', getQuality: (v: number) => v < 200 ? 'text-green-600' : v < 400 ? 'text-orange-500' : 'text-red-500' },
            { label: 'Added Sugar', unit: '(g)', icon: '🍪', key: 'addedSugar', getQuality: (v: number) => v < 5 ? 'text-green-600' : v < 15 ? 'text-orange-500' : 'text-red-500' },
            { label: 'Sodium', unit: '(mg)', icon: '🧂', key: 'sodium', getQuality: (v: number) => v < 120 ? 'text-green-600' : v < 400 ? 'text-orange-500' : 'text-red-500' },
            { label: 'Total Fat', unit: '(g)', icon: '⭕', key: 'fat', getQuality: (v: number) => v < 3 ? 'text-green-600' : v < 17.5 ? 'text-orange-500' : 'text-red-500' },
            { label: 'Saturated Fat', unit: '(g)', icon: '🥓', key: 'saturatedFat', getQuality: (v: number) => v < 1.5 ? 'text-green-600' : v < 5 ? 'text-orange-500' : 'text-red-500' },
            { label: 'Fiber', unit: '(g)', icon: '🌿', key: 'fiber', getQuality: (v: number) => v > 3 ? 'text-green-600' : v > 1.5 ? 'text-orange-500' : 'text-red-500' },
            { label: 'Protein', unit: '(g)', icon: '💪', key: 'protein', getQuality: (v: number) => v > 5 ? 'text-green-600' : v > 2 ? 'text-orange-500' : 'text-red-500' },
          ].map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <div className="p-3 pl-6 pr-4 border-r border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <span className="text-gray-400 w-4 text-center">{row.icon}</span>
                   <span className="text-sm font-semibold text-gray-900">{row.label} <span className="text-gray-400 font-normal">{row.unit}</span></span>
                </div>
              </div>
              {items.map((item, iIdx) => {
                const val = item ? (item.nutrition[row.key] || 0) : null;
                return (
                  <div key={iIdx} className="p-3 border-r border-gray-100 last:border-0 flex items-center justify-center">
                    {item ? (
                      <span className={`text-sm font-bold ${row.getQuality(val)}`}>{val}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Quality & Risk Header Row */}
          <div className="grid grid-cols-[1.5fr_4fr] bg-[#fdfdfd] border-b border-gray-100 mt-2">
             <div className="p-3 pl-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> Quality & Risk <br/><span className="font-normal text-gray-400 normal-case ml-6">(Ingredient Quality)</span>
                </h3>
             </div>
             <div className="flex items-center justify-center p-3 relative">
                 <div className="absolute top-1/2 -translate-y-1/2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-600 shadow-sm z-10 cursor-help">
                    Why this score? <span className="text-[10px]">▲</span>
                 </div>
             </div>
          </div>

          {/* Quality Rows */}
          {[
            { label: 'Oil Type', icon: '💧', key: 'oilText', qKey: 'oilQuality' },
            { label: 'Artificial Colors', icon: '🎨', key: 'colorsText', qKey: 'colorsQuality' },
            { label: 'Additive Risk (INS)', icon: '🧪', key: 'addText', qKey: 'addQuality', isMulti: true },
            { label: 'Sweetener Type', icon: '🍃', key: 'sweetText' },
            { label: 'NOVA Classification', icon: '🛡️', key: 'novaText' },
          ].map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <div className="p-3 pl-6 pr-4 border-r border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <span className="text-gray-400 w-4 text-center">{row.icon}</span>
                   <span className="text-sm font-semibold text-gray-900">{row.label}</span>
                </div>
              </div>
              {items.map((item, iIdx) => {
                if (!item) return <div key={iIdx} className="p-3 border-r border-gray-100 last:border-0 flex items-center justify-center"><span className="text-gray-300">-</span></div>;
                const qData = extractQualityData(item) as any;
                const text = qData[row.key];
                const quality = row.qKey ? qData[row.qKey] : null;
                
                const dotColor = quality === 'red' ? 'bg-red-500' : quality === 'orange' ? 'bg-orange-500' : quality === 'green' ? 'bg-green-500' : 'bg-transparent';
                const textColor = quality === 'red' ? 'text-red-600' : quality === 'orange' ? 'text-orange-500' : quality === 'green' ? 'text-green-600' : 'text-gray-700';

                return (
                  <div key={iIdx} className="p-3 border-r border-gray-100 last:border-0 flex items-center justify-start px-6 text-left">
                    <div className="flex flex-col text-sm text-gray-700 w-full">
                       {row.isMulti ? (
                         <span className={`font-semibold whitespace-pre-line ${textColor}`}>{text}</span>
                       ) : (
                         <div className="flex items-center justify-between w-full">
                           <span className={row.qKey ? textColor + ' font-medium' : ''}>{text}</span>
                           {row.qKey && <div className={`w-2 h-2 rounded-full ${dotColor} shrink-0 ml-2`}></div>}
                         </div>
                       )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

        </div>
      </div>

      {/* Footer Recommendation */}
      <div className="bg-gray-50/50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-3 bg-white p-3 px-5 rounded-xl border border-gray-100 shadow-sm flex-1 md:max-w-fit">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 shrink-0">
               <Trophy className="w-6 h-6" />
            </div>
            <div>
               <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Our Recommendation:</div>
               <div className="text-sm text-gray-700">
                 <span className="font-bold text-green-700">{bestItem?.name}</span> is the better choice overall.
               </div>
            </div>
         </div>
         <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-2 px-4 rounded-full border border-gray-100">
            <Info className="w-4 h-4" /> Hover over additive codes (INS) to see what they mean.
         </div>
      </div>
    </div>

    {/* Add Product Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900">Add Product to Compare</h3>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 border-b border-gray-100 relative">
            <Search className="w-4 h-4 absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent focus:bg-white focus:border-primary rounded-xl outline-none text-sm transition-colors"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {productsData
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.id !== currentProduct.id && !compareItems.find(c => c.id === p.id))
              .map(p => (
                <button 
                  key={p.id} 
                  onClick={() => handleAddProduct(p)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl text-left transition-colors"
                >
                  <div className="w-12 h-12 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 p-1">
                    <img src={`/${p.image}`} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.brand}</p>
                  </div>
                </button>
              ))
            }
          </div>
        </div>
      </div>
    )}
    </>
  );
}
