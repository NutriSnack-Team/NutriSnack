import { Users, Leaf, ShieldCheck, Search, Activity, Target, ScanLine, FileText, Cpu, Lightbulb } from 'lucide-react';
import { Hero, FeatureCard, StatsBar } from '@/components';
import { Link } from 'react-router-dom';

export function Landing() {
  const features = [
    {
      icon: Users,
      title: 'Age-Aware Scores',
      description: 'Personalized scores for 4 age groups.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Leaf,
      title: 'Ingredient Insights',
      description: 'Deep analysis of every ingredient.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: ShieldCheck,
      title: 'Explainable AI',
      description: 'Transparent score calculation you can trust.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Target,
      title: 'Better Alternatives',
      description: 'Discover healthier options instantly.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Activity,
      title: 'Manufacturer Tips',
      description: 'Actionable suggestions to improve products.',
      color: 'bg-teal-100 text-teal-600'
    },
    {
      icon: Search,
      title: 'Indian First',
      description: 'Built on Indian diet guidelines & FSSAI.',
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  const steps = [
    { title: 'Scan', desc: 'Upload or capture product image', icon: ScanLine, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    { title: 'Analyze', desc: 'AI reads nutrition & ingredients', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    { title: 'Score', desc: 'Age-aware NutriGuard Score calculated', icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    { title: 'Insights', desc: 'Get detailed analysis & recommendations', icon: Lightbulb, color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' },
    { title: 'Better Choices', desc: 'Choose healthier, live better', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-600' }
  ];

  const newLocal = "bg-linear-to-r from-green-50 to-green-100/50 rounded-[40px] overflow-hidden relative shadow-sm border border-green-100";
  const newLocal_1 = "hidden lg:block absolute top-10 right-[-40%] w-[80%] border-t-2 border-dashed border-gray-200 -z-10";
  return (
    <div className="bg-[#fdfdfd] min-h-screen">
      <Hero />
      <StatsBar />
      
      {/* Features Grid */}
      <section className="py-10 mt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>
      
      {/* How it Works */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-10">
             <Leaf className="w-5 h-5 text-green-500 transform -scale-x-100" />
             <h2 className="text-3xl font-bold tracking-tight text-gray-900">
               How NutriGuard <span className="text-primary">AI</span> Works
             </h2>
             <Leaf className="w-5 h-5 text-green-500" />
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-4 relative max-w-5xl mx-auto">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center relative z-10 w-full">
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center mb-4 border-2 shadow-sm bg-white ${step.border}`}>
                   <step.icon className={`w-8 h-8 mb-1 ${step.color}`} strokeWidth={1.5} />
                   
                </div>
                <h3 className={`font-bold text-[15px] mb-1 ${step.color}`}>{step.title}</h3>
                <p className="text-[12px] text-gray-500 max-w-35 leading-tight">{step.desc}</p>
                
                {/* Arrow connecting to next step */}
                {idx < steps.length - 1 && (
                  <div className={newLocal_1}>
                     <div className="absolute -right-2 -top-[5px] w-2 h-2 border-t-2 border-r-2 border-gray-300 transform rotate-45"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-10 pb-16">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={newLocal}>
               <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]"></div>
               
               <div className="grid lg:grid-cols-2 items-stretch h-full">
                 {/* Left side text */}
                 <div className="p-12 lg:p-16 relative z-10 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-24 bg-green-500 rounded-b-[40px] rounded-t-lg flex items-center justify-center shadow-lg relative overflow-hidden">
                         <div className="absolute top-0 w-full h-2 bg-green-600"></div>
                         <Leaf className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                      Small Choices Today,<br/>
                      <span className="text-primary">Better Health Tomorrow</span>
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md">
                      Scan any packaged food and get instant, age-aware insights you can trust.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mb-10">
                       <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-white/60 px-3 py-1 rounded-full"><span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px]">✓</span> WHO</span>
                       <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-white/60 px-3 py-1 rounded-full"><span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px]">✓</span> ICMR-NIN</span>
                       <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-white/60 px-3 py-1 rounded-full"><span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px]">✓</span> FSSAI</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link to="/scan" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 hover:bg-primary/90 transition-all">
                        <ScanLine className="w-5 h-5" /> Start Scanning Now
                      </Link>
                      <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white/80 px-8 py-3.5 text-sm font-semibold text-gray-700 hover:bg-white transition-all shadow-sm">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">▶</span> Watch Demo
                      </button>
                    </div>
                 </div>

                 {/* Right side family image */}
                 <div className="relative h-full min-h-[400px] hidden lg:block overflow-hidden">
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                       <img src="happy family.png" alt="Happy Family" className="w-full h-full object-cover object-center" />
                    </div>
                 </div>
               </div>
            </div>
         </div>
      </section>

      {/* Trust Footer */}
      <div className="border-t border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                    <ScanLine className="w-6 h-6 text-green-600" />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900 text-sm">Built on Trusted Nutrition Science</h4>
                    <p className="text-xs text-gray-500">Our scoring is based on WHO, ICMR-NIN & FSSAI guidelines and validated for Indian diets.</p>
                 </div>
              </div>
              <div className="flex items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                 <div className="text-sm font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full border-2 border-current"></div> WHO</div>
                 <div className="text-sm font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full border-2 border-current"></div> ICMR</div>
                 <div className="text-sm font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full border-2 border-current"></div> NIN</div>
                 <div className="text-sm font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full border-2 border-current"></div> FSSAI</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
