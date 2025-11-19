import React, { useState } from 'react';
import { Icon } from '../constants';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSlides = [
  {
    icon: 'plus-circle',
    title: 'スポットを簡単に追加',
    description: '「＋」ボタンから、行きたい場所や思い出の場所をすぐに登録できます。'
  },
  {
    icon: 'users',
    title: '個人・共有リストを管理',
    description: '自分だけのリストと、パートナーと共有するリストをタブで簡単に切り替えられます。'
  },
  {
    icon: 'sparkles',
    title: 'AIで情報を自動補完',
    description: 'URLを入力するだけで、AIがお店の情報を自動で入力。登録の手間を省きます。'
  }
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = onboardingSlides[currentSlide];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-8 text-center animate-fade-in">
      <div className="absolute top-4 right-4" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <button
          onClick={onComplete}
          className="px-4 py-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-full transition-colors"
        >
          スキップ
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div key={currentSlide} className="animate-fade-in-slide-up">
            <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-full mb-8 shadow-inner">
                <Icon name={slide.icon} className="w-16 h-16 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{slide.title}</h2>
            <p className="mt-4 text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">{slide.description}</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="flex justify-center gap-2 mb-8">
            {onboardingSlides.map((_, index) => (
                <div key={index} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-[#FF5252] w-6' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
            ))}
        </div>
        <button
          onClick={goToNext}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-lg shadow-[#FF5252]/30 transition-transform active:scale-95"
        >
          {currentSlide === onboardingSlides.length - 1 ? 'さあ、はじめよう！' : '次へ'}
        </button>
      </div>
       <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-slide-up { animation: fadeInSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeInSlideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingScreen;
