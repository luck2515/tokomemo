
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../constants';

const Header: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
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
      <div className="absolute inset-0 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md border-b border-neutral-200/30 dark:border-neutral-800/30" />
      <div className="relative flex items-center justify-center h-14 px-4" style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.5rem + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
           <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-tr from-rose-500 to-rose-400 rounded-xl shadow-lg shadow-rose-500/20 transform group-hover:rotate-12 transition-transform duration-300">
              <Icon name="heart" className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neutral-800 to-neutral-600 dark:from-white dark:to-neutral-300 tracking-tight">
            とこメモ
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
