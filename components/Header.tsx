
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../constants';

const Header: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at the very top
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF5252] to-[#E63946] shadow-md" />
      <div className="relative flex items-center justify-center h-14 px-4" style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.5rem + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-sm">
              <Icon name="heart" className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">とこメモ</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
