import React from 'react';
import { Icon } from '../constants';

interface OfflineBannerProps {
  isOffline: boolean;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline }) => {
  if (!isOffline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-neutral-700 to-neutral-800 text-white p-3 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-lg animate-slide-down"
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
    >
      <Icon name="wifi-slash" className="w-5 h-5" />
      <span>オフラインモードです。一部機能が制限されます。</span>
      <style>{`
        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OfflineBanner;