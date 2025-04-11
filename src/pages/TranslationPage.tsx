
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SurahSelector from '@/components/SurahSelector';
import { useSurahDetail } from '@/services/quranApi';
import { useSettings } from '@/contexts/SettingsContext';

const TranslationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSurah = parseInt(searchParams.get('surah') || '1', 10);
  
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const { surah, loading, error } = useSurahDetail(selectedSurah);
  const { fontSize } = useSettings();
  
  const handleSurahChange = (surahNumber: number) => {
    setSelectedSurah(surahNumber);
    setSearchParams({ surah: surahNumber.toString() });
  };
  
  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Translations</h1>
        
        <SurahSelector onSurahSelect={handleSurahChange} selectedSurah={selectedSurah} />
        
        {loading ? (
          <div className="text-center py-10">
            <div className="flex justify-center">
              <div className="audio-wave flex items-center">
                <span className="h-8"></span>
                <span className="h-12"></span>
                <span className="h-16"></span>
                <span className="h-12"></span>
                <span className="h-8"></span>
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading Translation...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
            Error loading translation. Please try again.
          </div>
        ) : surah ? (
          <div className="bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md mb-4">
            <h2 className="text-xl font-bold mb-2 flex justify-between">
              <span>{surah.englishName}</span>
              <span className="arabic-text">{surah.name}</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {surah.englishNameTranslation} • {surah.numberOfAyahs} Verses • {surah.revelationType}
            </p>
            
            <div className="space-y-4 mt-6">
              {surah.ayahs.map((ayah) => (
                <div key={ayah.numberInSurah} className="pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex items-center mb-2">
                    <div className="w-7 h-7 flex items-center justify-center bg-quran-primary/10 dark:bg-quran-primary/20 rounded-full text-quran-primary dark:text-quran-secondary font-semibold text-xs mr-2">
                      {ayah.numberInSurah}
                    </div>
                  </div>
                  
                  {ayah.translation && (
                    <p className="text-gray-800 dark:text-gray-200" style={{ fontSize: `${fontSize - 2}px` }}>
                      {ayah.translation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default TranslationPage;
