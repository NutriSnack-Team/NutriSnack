import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Navbar, Footer } from '@/components';

// Lazy load pages for performance
const Landing = lazy(() => import('@/features/home/Landing').then(module => ({ default: module.Landing })));
const Products = lazy(() => import('@/features/products/Products').then(module => ({ default: module.Products })));
const Scan = lazy(() => import('@/features/scan/Scan').then(module => ({ default: module.Scan })));
const About = lazy(() => import('@/pages').then(module => ({ default: module.About })));
const HowItWorks = lazy(() => import('@/pages').then(module => ({ default: module.HowItWorks })));
const FAQs = lazy(() => import('@/pages').then(module => ({ default: module.FAQs })));

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />

        <main className="flex-1 flex flex-col">
          <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/products" element={<Products />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/product/:id" element={<Scan />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/faqs" element={<FAQs />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
