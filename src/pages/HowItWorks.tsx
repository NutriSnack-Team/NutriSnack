import { Search, Database, Calculator, FileText } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: '1. Data Extraction',
      description: 'The process begins by scanning the product packaging. Our OCR models extract critical data including the nutritional table, ingredients list, and any additive codes (INS numbers) printed on the label.',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Database,
      title: '2. Ingredient Analysis',
      description: 'Extracted ingredients are cross-referenced against a comprehensive nutritional database. The system flags harmful additives, allergens, and ultra-processed components utilizing the established NOVA classification system.',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: Calculator,
      title: '3. Age-Aware Scoring',
      description: 'The raw nutritional data is processed through an algorithmic scoring model. This model adjusts its thresholds based on age demographics, ensuring that a product is evaluated correctly whether intended for children or adults.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: FileText,
      title: '4. Explainable Output',
      description: 'Finally, an Assessment Score is generated alongside a comprehensive data sheet. This sheet provides full transparency, detailing exactly which nutritional factors or ingredients contributed to the final score.',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Methodology & Pipeline</h1>
        <p className="text-xl text-gray-600 font-medium mb-12">
          Understanding the analytical pipeline that powers the NutriGuard AI Assessment Score.
        </p>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-white shadow-sm md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shrink-0">
                   <div className={`w-full h-full rounded-full flex items-center justify-center ${step.bg}`}>
                      <Icon className={`w-5 h-5 ${step.color}`} />
                   </div>
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-xl border border-gray-200 shadow-sm ml-4 md:ml-0 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
