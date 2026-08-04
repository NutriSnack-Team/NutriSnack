import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function FAQs() {
  const faqs = [
    {
      question: "How is the Assessment Score calculated?",
      answer: "The Assessment Score is derived using a proprietary algorithmic model that weights macro and micro nutrients against established dietary guidelines provided by the Indian Council of Medical Research - National Institute of Nutrition (ICMR-NIN). It penalizes excessive sodium, sugar, and saturated fats while rewarding positive nutritional metrics."
    },
    {
      question: "What is the NOVA classification system?",
      answer: "The NOVA classification system is an internationally recognized framework that groups foods according to the extent and purpose of the industrial processing they undergo. It ranges from Group 1 (Unprocessed/minimally processed foods) to Group 4 (Ultra-processed foods)."
    },
    {
      question: "Is the data provided by NutriGuard AI peer-reviewed?",
      answer: "The underlying nutritional thresholds and health correlations are based on established scientific consensus and peer-reviewed literature. However, our specific algorithmic implementation is currently undergoing rigorous validation studies."
    },
    {
      question: "How does the age-aware scoring work?",
      answer: "Nutritional Recommended Dietary Allowances (RDA) vary by demographic. Our model uses user-provided age profiles to dynamically adjust the penalty thresholds for ingredients like sodium and sugar, ensuring the score reflects the actual nutritional impact for that specific demographic."
    },
    {
      question: "Can this tool replace professional medical advice?",
      answer: "No. NutriGuard AI is designed as a supplementary informational tool for researchers and informed consumers. It should not be used as a substitute for professional dietary counseling or medical advice."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center text-center mb-12">
           <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
             <HelpCircle className="w-8 h-8 text-blue-600" />
           </div>
           <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Frequently Asked Questions</h1>
           <p className="text-lg text-gray-600">Common queries regarding the methodology, data processing, and limitations of the NutriGuard AI platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`bg-white border ${isOpen ? 'border-blue-200 shadow-md' : 'border-gray-200 shadow-sm'} rounded-xl overflow-hidden transition-all duration-200`}
              >
                <button 
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className={`font-semibold ${isOpen ? 'text-blue-700' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ml-4" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="w-full h-px bg-gray-100 mb-4"></div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
