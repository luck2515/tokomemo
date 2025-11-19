import React from 'react';
import { Icon } from '../constants';

const AdBanner: React.FC = () => {
  return (
    <div className="col-span-2 md:col-span-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden shadow-md flex items-center justify-center p-4 aspect-[4/3]">
      <div className="text-center text-neutral-400 dark:text-neutral-600">
        <Icon name="photo" className="w-12 h-12 mx-auto" />
        <p className="mt-2 text-sm font-medium">Advertisement</p>
      </div>
    </div>
  );
};

export default AdBanner;