import { ShieldCheck, Target, Users } from 'lucide-react';

export function About() {
  return (
    <div className="bg-[#fcfcfc] min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">About NutriGuard AI</h1>
        
        <div className="prose prose-lg prose-green max-w-none text-gray-600 mb-12">
          <p className="lead text-xl text-gray-700 font-medium mb-6">
            NutriGuard AI is a research-driven platform designed to bring transparency, scientific rigor, and explainability to the assessment of packaged foods in India.
          </p>
          <p className="mb-6">
            With the rapid proliferation of ultra-processed foods (UPFs), consumers and researchers alike face challenges in deciphering complex nutritional labels and obscure ingredient lists. Our initiative bridges this gap by leveraging advanced artificial intelligence and established nutritional science frameworks to provide clear, actionable data.
          </p>
          <p>
            Our core assessment model is built upon the dietary guidelines formulated by the World Health Organization (WHO), the Indian Council of Medical Research - National Institute of Nutrition (ICMR-NIN), and the Food Safety and Standards Authority of India (FSSAI).
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Scientific Rigor</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every Assessment Score is calculated using peer-reviewed methodologies, minimizing bias and ensuring reproducible results across diverse food categories.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Age-Aware Metrics</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nutritional requirements vary significantly across demographics. Our model dynamically adjusts thresholds for children, adults, and seniors.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Explainable AI</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              We reject "black-box" scoring. NutriGuard AI provides detailed data sheets explaining exactly which ingredients or macro-nutrients impacted the final grade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
