import { Link } from 'react-router-dom';
import { ScanLine, Box } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-[#fdfdfd] pt-4 lg:pt-8 pb-10">
      
      {/* Background Decorative Shapes */}
      <div className="absolute top-0 right-0 w-[50%] h-[120%] bg-green-50/50 rounded-l-[150px] -z-10 transform translate-x-10 -translate-y-10"></div>
      <svg className="absolute top-20 right-[40%] text-green-200/50 w-16 h-16 transform -rotate-12 z-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <svg className="absolute bottom-40 right-10 text-green-200/50 w-20 h-20 transform rotate-45 z-0" viewBox="0 0 24 24" fill="currentColor">
         <path d="M17.3 5.3c-1.8-1.8-4.8-1.8-6.6 0l-.7.7-.7-.7c-1.8-1.8-4.8-1.8-6.6 0-1.8 1.8-1.8 4.8 0 6.6l7.3 7.3 7.3-7.3c1.8-1.8 1.8-4.8 0-6.6z" />
      </svg>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTA */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-5 lg:text-left relative z-10">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-white border border-gray-100 shadow-sm text-sm font-medium text-gray-700 mb-6">
              <span className="text-base leading-none">🇮🇳</span> India's First Age-Aware Food Assessment AI
            </div>

            <h1 className="text-5xl tracking-tight font-normal text-gray-900 sm:text-6xl md:text-[64px] leading-[1.1] mb-4">
              Scan Smarter.<br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-green-700">Eat Better.</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto lg:mx-0">
              NutriGuard AI analyzes packaged foods using advanced AI, age-aware scoring & Indian nutrition science to help you choose what's best for every age.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                to="/scan"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-green-400 to-green-700 px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-green-500/30 hover:from-green-500 hover:to-green-800 hover:scale-105 transform transition-all"
              >
                <ScanLine className="h-5 w-5" />
                Scan a Product Now
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-primary hover:border-primary hover:scale-105 transform transition-all group"
              >
                <Box className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                Explore Products
              </Link>
            </div>
          </div>

          <div className="mt-10 sm:mt-12 lg:mt-0 lg:col-span-7 relative z-10 flex justify-center items-center">
             <img src="/hero.png" alt="NutriGuard App" className="w-full max-w-150 h-auto" />
          </div>
        </div>
      </div>
      
      {/* Curved Bottom SVG */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto translate-y-1">
          <path d="M0 100V45.719C208.57 14.862 485.49 0 720 0C954.51 0 1231.43 14.862 1440 45.719V100H0Z" fill="white"/>
        </svg>
      </div>

    </div>
  );
}
