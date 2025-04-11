
import React from 'react';
import { Info } from 'lucide-react';
import { SurahDetail } from '@/services/quranApi';
import { useSettings } from '@/contexts/SettingsContext';

interface SurahInfoProps {
  surah: SurahDetail;
}

const SurahInfo: React.FC<SurahInfoProps> = ({ surah }) => {
  const { fontColor } = useSettings();
  
  return (
    <div className="mb-6 bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">{surah.englishName}</h1>
        <h2 
          className="text-xl font-bold arabic-text" 
          style={{ color: fontColor }}
        >
          {surah.name}
        </h2>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600 dark:text-gray-300">
        <div className="bg-quran-primary/10 dark:bg-quran-primary/20 px-3 py-1 rounded-full">
          <span className="font-semibold">Surah {surah.number}</span>
        </div>
        <div className="bg-quran-secondary/10 dark:bg-quran-secondary/20 px-3 py-1 rounded-full">
          <span>{surah.englishNameTranslation}</span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          <span>{surah.revelationType}</span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          <span>{surah.numberOfAyahs} Verses</span>
        </div>
      </div>
    </div>
  );
};

export default SurahInfo;
