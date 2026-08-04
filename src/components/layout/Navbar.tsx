import { Link, useLocation } from 'react-router-dom';
import { ScanLine, Home, Package, Info, Settings, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Scan', path: '/scan', icon: ScanLine },
    { name: 'About Us', path: '/about', icon: Info },
    { name: 'How It Works', path: '/how-it-works', icon: Settings },
    { name: 'FAQs', path: '/faqs', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <svg className="h-8 w-8" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#logo-gradient)" />
            <path d="M12 16.5c-2-2-3-4.5-3-7 0-.5.1-1 .2-1.5 1.5 0 3 .5 4.5 1.5.5-1 1.5-1.5 2.5-1.5-2.5 3-4 6-4.2 8.5z" fill="white" />
          </svg>
          <div>
            <h1 className="text-[22px] font-bold leading-none tracking-tight text-gray-900">NutriGuard <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-700">AI</span></h1>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5">Smarter Choices, Better Health</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-8 h-full items-center">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-[15px] font-medium transition-colors relative pb-1",
                  isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-gray-900"
                )}
              >
                {link.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          <Link
            to="/scan"
            className="hidden md:inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-400 to-green-700 px-5 py-2.5 text-[14px] font-bold text-white shadow-sm hover:opacity-90 transition-all"
          >
            <ScanLine className="h-4.5 w-4.5" strokeWidth={2.5} />
            Scan a Product
          </Link>
        </div>
      </div>
    </header>
  );
}
